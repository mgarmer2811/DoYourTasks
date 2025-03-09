import supabase from "../../../../../utils/supabase";

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return new Response(
                JSON.stringify({ error: "Username and password are required" }),
                { status: 400 }
            );
        }

        const { data: userData, error: userError } = await supabase
            .from("user")
            .select("email")
            .eq("username", username)
            .single();

        if (userError || !userData) {
            console.log("user error: ", userError);
            console.log("user data: ", userData);
            return new Response(
                JSON.stringify({ error: "User not found or doesn't exist" }),
                { status: 404 }
            );
        }

        const { data: sessionData, error: authError } =
            await supabase.auth.signInWithPassword({
                email: userData.email,
                password: password,
            });

        if (authError) {
            return new Response(JSON.stringify({ error: authError.message }), {
                status: 400,
            });
        }

        return new Response(
            JSON.stringify({
                success: "Login successful",
                session: sessionData.session,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Server error:", error);
        return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
        });
    }
}
