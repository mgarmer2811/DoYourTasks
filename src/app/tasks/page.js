"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../auth/authContext";
import Cookies from "js-cookie";
import supabase from "../../../utils/supabase";
import { PlusIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import {
    ClipboardDocumentListIcon,
    CalendarIcon,
} from "@heroicons/react/24/outline";

export default function Tasks() {
    const { user } = useAuth();
    const router = useRouter();
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [showInput, setShowInput] = useState(false);
    const [category, setCategory] = useState(1);

    const textareaRef = useRef(null);

    useEffect(() => {
        const tokenData = Cookies.get("supabase-auth-token");
        if (!user && !tokenData) {
            router.push("/auth/signIn");
        } else if (tokenData) {
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

    async function handleAddNote() {
        if (!user.email || !newNote.trim()) {
            return;
        }

        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_email: user.email,
                text: newNote,
                category: category,
                due_date: new Date(),
            }),
        });

        const data = await response.json();

        if (response.ok) {
            setNewNote("");
            setShowInput(false);
            fetchNotes();
        } else {
            alert("Error adding note: " + data.error);
        }
    }

    async function handleDeleteNote(id) {
        const response = await fetch("/api/tasks", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
        });

        const data = await response.json();

        if (response.ok) {
            fetchNotes();
        } else {
            console.error("Error deleting note:", data.error);
        }
    }

    function handleChangeCategory(num) {
        setCategory(num);
    }

    return (
        <div className="relative bg-[#151416] min-h-screen pt-20 pb-20">
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
                            } focus:outline-none`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            <ul className="p-4">
                {notes.map((note) => (
                    <li
                        key={note.id}
                        className="flex items-center bg-[#E8EAEE] p-4 rounded-full mb-2 shadow-md"
                    >
                        <input
                            type="checkbox"
                            onChange={() => handleDeleteNote(note.id)}
                            className="w-8 h-8 rounded-full border-2 border-[#86898C] mr-4 focus:outline-none"
                        />
                        <div className="flex-1">
                            <p>{note.text}</p>
                            <small className="text-[#757575]">
                                {new Date(note.due_date).toLocaleDateString()}
                            </small>
                        </div>
                    </li>
                ))}
            </ul>

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

            <button
                onClick={() => setShowInput(true)}
                className="fixed bottom-24 right-6 bg-[#CD0E14] text-[#E8EAEE] w-16 h-16 flex items-center justify-center rounded-full shadow-lg focus:outline-none z-20"
            >
                <PlusIcon className="w-8 h-8" />
            </button>

            <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#151416] flex justify-around items-center rounded-t-lg z-10">
                <button
                    onClick={() => router.push("/tasks")}
                    className="flex flex-col items-center"
                >
                    <ClipboardDocumentListIcon className="w-8 h-8 text-[#CD0E14]" />
                    <span className="text-[#CD0E14] text-sm">Tasks</span>
                </button>
                <button
                    onClick={() => router.push("/calendar")}
                    className="flex flex-col items-center"
                >
                    <CalendarIcon className="w-8 h-8 text-[#E8EAEE]" />
                    <span className="text-[#E8EAEE] text-sm">Calendar</span>
                </button>
            </div>
        </div>
    );
}
