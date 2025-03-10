"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    UserIcon,
    LockClosedIcon,
    EnvelopeIcon,
} from "@heroicons/react/24/solid";
import useAuth from "../authContext";

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const router = useRouter();

    async function handleRegister(event) {
        event.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim() || !username.trim()) {
            alert("All fields must be filled out");
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            alert("Invalid email format");
            return;
        }
        if (password.length < 5) {
            alert("Password must be at least 5 characters long");
            return;
        }

        const response = await fetch("/api/auth/signUp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, username }),
        });
        const result = await response.json();

        if (!response.ok) {
            setError(result.error || "Error during registration");
            return;
        }

        router.push("/auth/signIn");
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#151416]">
            <div className="w-96 p-8 rounded-3xl bg-[#2c2b2e] shadow-2xl">
                <h1 className="text-4xl font-bold text-[#E8EAEE] text-center uppercase">
                    DoYourTasks
                </h1>
                <hr className="my-4 border-[#E8EAEE]" />

                {error && <p className="text-red-500 text-center">{error}</p>}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-700" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 p-3 rounded-full bg-[#E8EAEE] text-black outline-none"
                        />
                    </div>

                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-700" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full pl-10 p-3 rounded-full bg-[#E8EAEE] text-black outline-none"
                        />
                    </div>

                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-700" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 p-3 rounded-full bg-[#E8EAEE] text-black outline-none"
                        />
                    </div>

                    <p className="text-center">
                        <Link
                            href="/auth/signIn"
                            className="text-[#E8EAEE] underline"
                        >
                            Already have an account?
                        </Link>
                    </p>

                    <button
                        type="submit"
                        className="w-full p-3 rounded-full bg-[#cd0e14] text-[#E8EAEE] font-bold"
                    >
                        SIGN UP
                    </button>
                </form>
            </div>
        </div>
    );
}
