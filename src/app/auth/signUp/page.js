"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

        if (email === "") {
            alert("Email field is blank. Please fill it");
            return;
        }
        if (password === "") {
            alert("Password field is blank. Please fill it");
            return;
        }
        if (username === "") {
            alert("Username field is blank. Please fill it");
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            alert("Email format invalid. Try something like: aaaa@gg.pp");
        }
        if (password.length < 5) {
            alert(
                "Password field invalid. Password must contain at least 5 characters"
            );
        }

        const response = await fetch("/api/auth/signUp", {
            method: "POST",
            headers: { "Content-Type": "application-json" },
            body: JSON.stringify({ email, password, username }),
        });
        const result = await response.json();

        if (!response.ok) {
            setError(result.error || "Error en el registro");
            return;
        }

        router.push("/auth/signIn");
    }

    return (
        <div>
            <h1>
                <i>
                    <b>DoYourTasks</b>
                </i>
            </h1>
            {error && <p>{error}</p>}
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="********"
                    value={password}
                    minLength="5"
                    title="Must contain at least 5 characters"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Sign Up</button>
            </form>
            <p>
                <Link href={"/auth/signIn"}>Already have an account?</Link>
            </p>
        </div>
    );
}
