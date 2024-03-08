import { authenticator } from "~/services/auth.server";
import mongoose from "mongoose";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

export const loader = async ({ params, request }) => {
    const user = await authenticator.isAuthenticated(request);
    if (!user) {
        return redirect("/login");
    }
    const currentChat = await mongoose.models.Messenger.findOne({
        $or: [
            { participants: user }
        ]
    });

    return currentChat;
};

export default function Messenger() {
    const currentChat = useLoaderData();
    return (
        <div>
            <h1>Messenger</h1>
            <div>
                {
                    /* console.log(currentChat, currentChat.length), */
                    (currentChat.length > 0) ? (
                        currentChat.map((chat) => (
                            <div key={chat._id}>
                                <Link to={`/messenger/${chat._id}`}>
                                    <h2>
                                        {
                                            chat.participants.map((participant) => (
                                                participant
                                            ))
                                        }
                                    </h2>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <Link to={`/messenger/${currentChat._id}`} key={currentChat._id}>
                            <h2>
                                {currentChat.participants[0]}
                            </h2>
                        </Link>
                    )
                }
            </div>
        </div>
    );
}