"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import useAuth from "../authContext";
import Cookies from "js-cookie";
import { Doto } from "next/font/google";

const doto = Doto({ subsets: ["latin"] });

export default function SignIn() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const { user, setUser } = useAuth();
    const router = useRouter();

    async function handleLogin(event) {
        event.preventDefault();
        setError(null);

        if (!username.trim()) {
            alert("Username field is blank. Please fill it");
            return;
        }
        if (!password.trim()) {
            alert("Password field is blank. Please fill it");
            return;
        }

        const response = await fetch("/api/auth/signIn", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        if (!response.ok) {
            setError(result.error || "Error in login");
            return;
        }

        const session = result.session;
        if (session?.user) {
            setUser(session.user);
            Cookies.set(
                "supabase-auth-token",
                JSON.stringify({
                    access_token: session.access_token,
                    refresh_token: session.refresh_token,
                }),
                { expires: 15 }
            );
        }

        router.push("/tasks");
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#151416]">
            <div className="w-96 p-8 rounded-3xl bg-[#2c2b2e] shadow-2xl">
                <h1
                    className={`text-4xl font-bold text-[#E8EAEE] text-center uppercase ${doto.className}`}
                >
                    DoYourTasks
                </h1>
                <hr className="my-4 border-[#E8EAEE]" />

                {error && <p className="text-red-500 text-center">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-6">
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
                            href="/auth/signUp"
                            className="text-[#E8EAEE] underline"
                        >
                            Don't have an account?
                        </Link>
                    </p>

                    <button
                        type="submit"
                        className={`w-full p-3 rounded-full bg-[#cd0e14] text-[#E8EAEE] font-bold text-xl ${doto.className}`}
                    >
                        LOGIN
                    </button>
                </form>
            </div>
        </div>
    );
}
