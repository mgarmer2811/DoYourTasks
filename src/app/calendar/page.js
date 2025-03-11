"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../auth/authContext";
import Cookies from "js-cookie";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import supabase from "../../../utils/supabase";
import { PlusIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { Doto } from "next/font/google";

const doto = Doto({ subsets: ["latin"] });

export default function CalendarPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [showInput, setShowInput] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [notesForSelectedDate, setNotesForSelectedDate] = useState([]);
    const [category, setCategory] = useState(1);

    const textareaRef = useRef(null);

    useEffect(() => {
        const tokenData = Cookies.get("supabase-auth-token");
        if (!user && !tokenData) {
            router.push("/auth/signIn");
        } else if (tokenData) {
            try {
                const { access_token, refresh_token } = JSON.parse(tokenData);
                supabase.auth
                    .setSession({ access_token, refresh_token })
                    .then(({ data }) => {
                        if (!data.session) {
                            router.push("/auth/signIn");
                        } else {
                            fetchNotes(1);
                        }
                    });
            } catch (error) {
                console.error("Error parsing auth token:", error);
                router.push("/auth/signIn");
            }
        }
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [category]);

    useEffect(() => {
        if (showInput && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [showInput]);

    useEffect(() => {
        filterNotesForSelectedDate(notes, selectedDate);
    }, [selectedDate, notes]);

    async function fetchNotes(cat = category) {
        const tokenData = Cookies.get("supabase-auth-token");

        if (!user && !tokenData) {
            router.push("/auth/signIn");
            return;
        }

        const url = "/api/tasks?email=" + user?.email + "&category=" + cat;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            alert("Error fetching notes: " + data.error);
            return;
        }

        setNotes(data);
    }

    function filterNotesForSelectedDate(notes, date) {
        const filteredNotes = notes.filter((note) => {
            const noteDate = new Date(note.due_date);
            return (
                noteDate.getFullYear() === date.getFullYear() &&
                noteDate.getMonth() === date.getMonth() &&
                noteDate.getDate() === date.getDate()
            );
        });
        setNotesForSelectedDate(filteredNotes);
    }

    function handleDateSelect(date) {
        setSelectedDate(date);
    }

    async function handleAddNote() {
        if (!newNote.trim() || !selectedDate) return;

        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_email: user?.email,
                text: newNote,
                category: category,
                due_date: selectedDate.toISOString(),
            }),
        });

        const data = await response.json();

        if (response.ok) {
            setNewNote("");
            setShowInput(false);
            fetchNotes();
            handleDateSelect(selectedDate);
        } else {
            alert("Error adding note:", data.error);
        }
    }

    function handleChangeCategory(num) {
        setCategory(num);
    }

    return (
        <div className="relative bg-[#151416] min-h-screen flex flex-col pt-20">
            <h3
                className={`text-[#E8EAEE] text-3xl text-center ${doto.className}`}
            >
                Calendario
            </h3>

            <div className="fixed top-0 left-0 right-0 bg-[#151416] z-10 p-4 flex gap-4 justify-between">
                {["All", "Work", "Personal"].map((label, index) => {
                    const categoryNumber = index + 1;
                    return (
                        <button
                            key={label}
                            onClick={() => handleChangeCategory(categoryNumber)}
                            className={`flex-1 px-6 py-2 rounded-full text-[#E8EAEE] ${
                                category === categoryNumber
                                    ? "bg-[#CD0E14]"
                                    : "bg-[#86898C] hover:bg-[#A6A9AB]"
                            }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            <div className="mt-20 flex justify-center">
                <Calendar
                    onChange={handleDateSelect}
                    value={selectedDate}
                    className="bg-[#151416] text-[#E8EAEE] border border-[#86898C] rounded-lg p-4"
                />
            </div>

            <div className="flex-1 overflow-y-auto mt-6 mb-20">
                <h4 className="text-[#E8EAEE] text-xl text-center">
                    Notas para {selectedDate.toLocaleDateString()}
                </h4>
                <ul className="p-4">
                    {notesForSelectedDate.map((note) => (
                        <li
                            key={note.id}
                            className="flex items-center bg-[#E8EAEE] p-4 rounded-full mb-2 shadow-md"
                        >
                            <div className="flex-1">
                                <p>{note.text}</p>
                                <small className="text-[#757575]">
                                    {new Date(
                                        note.due_date
                                    ).toLocaleDateString()}
                                </small>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {showInput && (
                <div className="fixed left-1/2 transform -translate-x-1/2 top-1/4 w-11/12 max-w-md bg-[#776E6A] p-6 rounded-lg shadow-lg z-20">
                    <textarea
                        ref={textareaRef}
                        className="w-full bg-[#E8EAEE] p-4 rounded-lg resize-none"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Escribe tu nota..."
                    />
                    <button
                        onClick={handleAddNote}
                        className="mt-4 bg-[#CD0E14] text-[#E8EAEE] w-16 h-16 flex items-center justify-center rounded-full shadow-lg focus:outline-none mx-auto"
                    >
                        <ArrowUpIcon className="w-8 h-8" />
                    </button>
                </div>
            )}

            {!showInput && (
                <button
                    onClick={() => setShowInput(true)}
                    className="fixed bottom-24 right-6 bg-[#CD0E14] text-[#E8EAEE] w-16 h-16 flex items-center justify-center rounded-full shadow-lg focus:outline-none z-20"
                >
                    <PlusIcon className="w-8 h-8" />
                </button>
            )}

            <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#151416] flex justify-around items-center rounded-t-lg z-10">
                <button
                    onClick={() => router.push("/tasks")}
                    className="flex flex-col items-center"
                >
                    <ClipboardDocumentListIcon className="w-8 h-8 text-[#E8EAEE]" />
                    <span className="text-[#E8EAEE] text-sm">Tasks</span>
                </button>
                <button
                    onClick={() => router.push("/calendar")}
                    className="flex flex-col items-center"
                >
                    <CalendarIcon className="w-8 h-8 text-[#CD0E14]" />
                    <span className="text-[#CD0E14] text-sm">Calendar</span>
                </button>
            </div>
        </div>
    );
}
