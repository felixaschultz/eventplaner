import { authenticator } from "~/services/auth.server";
import mongoose from "mongoose";
import { redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

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

    if(currentChat){
        currentChat?.messages
    }


    return {currentChat, user};
};

export default function Messenger() {
    const {currentChat, user} = useLoaderData();
    return (
        <div className="grid grid-cols-2 p-3 bg-slate-900 text-slate-200">
            <div>
                <h1 className="text-2xl text-bold">Chats</h1>
                {
                    (currentChat?.length > 0) ? (
                        currentChat?.map((chat) => (
                            <Link key={chat._id} className="block p-2" to={`/messenger/${chat._id}`}>
                                <h2 className="text-xl">
                                    {
                                        chat?.participants?.map((participant) => (
                                            participant
                                        ))
                                    }
                                </h2>
                            </Link>
                        ))
                    ) : (currentChat) ? (
                        <Link className="block p-2" to={`/messenger/${currentChat._id}`} key={currentChat._id}>
                            <h2 className="flex w-max transition-all items-center hover:bg-slate-200 hover:text-slate-600 p-2 rounded-md">
                                {(currentChat?.messages[0].sender.name !== user.name) ? 
                                    <>
                                        <img className="profile-picture" src={(currentChat?.messages[0].sender.image) ? currentChat?.messages[0].sender.image : "https://scontent-uc-d2c-7.intastellar.com/a/s/ul/p/avtr46-img/profile_standard.jpg"} alt={
                                            currentChat?.messages[0].sender.name
                                        } />
                                        {currentChat?.messages[0].sender.name}
                                    </> :
                                     <>
                                        <img className="profile-picture" src={(currentChat?.messages[0].receiver.image) ? currentChat?.messages[0].receiver.image : "https://scontent-uc-d2c-7.intastellar.com/a/s/ul/p/avtr46-img/profile_standard.jpg"} alt={
                                            currentChat?.messages[0].receiver.name
                                        } />
                                        {currentChat?.messages[0].receiver.name}
                                    </>}
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