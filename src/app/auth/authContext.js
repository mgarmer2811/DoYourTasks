"use client";

import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../../../utils/supabase";
import Cookies from "js-cookie";

const AuthContext = createContext();

export default function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkUser(setUser);
        supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            if (session) {
                Cookies.set(
                    "supabase-auth-token",
                    JSON.stringify({
                        access_token: session.access_token,
                        refresh_token: session.refresh_token,
                    }),
                    { expires: 15 }
                );
            } else {
                Cookies.remove("supabase-auth-token");
            }
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

async function checkUser(setUser) {
    const tokenData = Cookies.get("supabase-auth-token");
    if (tokenData) {
        try {
            const { data } = await supabase.auth.getSession();
            setUser(data.session ? data.session.user : null);
        } catch (error) {
            console.error("Error fetching session:", error);
            setUser(null);
        }
    } else {
        setUser(null);
    }
}
