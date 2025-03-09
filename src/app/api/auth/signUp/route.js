import supabase from "../../../../../utils/supabase";

export async function POST(request) {
    try {
        const { email, password, username } = await request.json();

        if (email === "") {
            return new Response(
                JSON.stringify({
                    error: "Email field is blank. Please fill it",
                }),
                { status: 400 }
            );
        }
        if (password === "") {
            return new Response(
                JSON.stringify({
                    error: "Password field is blank. Please fill it",
                }),
                { status: 400 }
            );
        }
        if (username === "") {
            return new Response(
                JSON.stringify({
                    error: "Username field is blank. Please fill it",
                }),
                { status: 400 }
            );
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return new Response(
                JSON.stringify({
                    error: "Username format invalid. Try something like: aaaa@gg.pp",
                }),
                { status: 400 }
            );
        }
        if (password.length < 5) {
            return new Response(
                JSON.stringify({
                    error: "Password field invalid. Password must contain at least 5 characters",
                }),
                { status: 400 }
            );
        }

        const { data, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (authError) {
            return new Response(JSON.stringify({ error: authError.message }), {
                status: 400,
            });
        }

        const user = {
            id: data.user.id,
            email: email,
            username: username,
        };
        const { error: userError } = await supabase.from("user").insert(user);

        if (userError) {
            return new Response(JSON.stringify({ error: userError.message }), {
                status: 400,
            });
        }

        return new Response(
            JSON.stringify({ success: "Successful sign up!" }),
            { status: 201 }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
        });
    }
}
