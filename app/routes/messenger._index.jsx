import { authenticator } from "~/services/auth.server";
import mongoose from "mongoose";
import { redirect } from "@remix-run/node";

export const loader = async ({ params, request }) => {
    const user = await authenticator.isAuthenticated(request);
    if (!user) {
        return redirect("/login");
    }
    const currentChat = await mongoose.models.Messenger.findOne({
        $or: [
            { participants: user },
            { participants: params.id }
        ]
    });

    return new Response(null, {
        status: 302,
        headers: {
            Location: "/messenger/" + currentChat.messages[0].receiver
        }
    });
};