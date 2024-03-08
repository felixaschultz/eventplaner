import { authenticator } from "~/services/auth.server";
import mongoose from "mongoose";
import { redirect } from "@remix-run/node";
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
    }).populate('messages.sender').populate('messages.receiver').exec();

    console.log(currentChat.messages[0].sender, currentChat.messages[0].receiver);

    if(currentChat){
        currentChat?.messages
    }


    return {currentChat, user};
};

export default function Messenger() {
    const {currentChat, user} = useLoaderData();
    return (
        <div>
            <h1>Messenger</h1>
            <div>
                {
                    (currentChat?.length > 0) ? (
                        currentChat?.map((chat) => (
                            <div key={chat._id}>
                                <Link to={`/messenger/${chat._id}`}>
                                    <h2>
                                        {
                                            chat?.participants?.map((participant) => (
                                                participant
                                            ))
                                        }
                                    </h2>
                                </Link>
                            </div>
                        ))
                    ) : (currentChat) ? (
                        <Link to={`/messenger/${currentChat._id}`} key={currentChat._id}>
                            <h2>
                                {(currentChat?.messages[0].sender.name !== user.name) ? currentChat?.messages[0].sender.name : currentChat?.messages[0].receiver.name}
                            </h2>
                        </Link>
                    ) : (
                        <h2>No messages</h2>
                    )
                }
            </div>
        </div>
    );
}