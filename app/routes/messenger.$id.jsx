import { useLoaderData, useFetcher, redirect, useLocation,Link } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useRevalidator } from "@remix-run/react";
import MessageContainer from "~/components/MessengerContainer";
import { authenticator } from "~/services/auth.server";

import moment from "moment";
import mongoose from "mongoose";
import "../Styles/chat.css";
import messengerIcon from "../assets/Asset 13.svg";

export const meta = () => {
    return [
        { title: "Chat" },
        { name: "description", content: "Welcome to Remix!" },
    ];
}

export const loader = async ({ params, request }) => {
    const user = await authenticator.isAuthenticated(request)

    if(!user){
        return redirect("/login");
    }

    const id = params.id;

    let [chat] = await mongoose.models.Messenger.find({
        $or: [
        {_id: new mongoose.Types.ObjectId(id)},
        { participants: user },
        { participants: id }
      ]}).sort({ date: 1 });

    if(chat === undefined){
        return new Response(null, {
            status: 404,
            text: "Chat not found",
        });
    }

    chat = chat.messages?.map((message) => {
        message.date = moment(message.date).format("YYYY-MM-DD HH:mm:ss");
        if(message.timestamp >= moment().subtract(5, "minutes").unix()){
            chat.unread = true;
        }
        return message;
    });

    chat?.forEach((message) => {
        /* Find user */
        (message.message.match(/@(\w+)/g) || []).forEach((match) => {
            const username = match.slice(1);
            message.message = message.message.replace(match, `<a href="/chat/${id}/@${username}">${match}</a>`);
        });

        /* Find YouTube Videos */
        (message.message.match(/https:\/\/www.youtube.com\/watch\?v=(\w+)/g) || []).forEach((match) => {
            const videoId = match.split("v=")[1];
            message.message = message.message.replace(match, `<iframe width="720" height="auto" style="aspect-ratio: 16/9;" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
        });

        message.you = message.user === user;
    });

    const buddy = chat.map(message => {
        if(message.sender != user){
            return message.sender
        }else{
            return message.receiver
        }
    });

    const currentChat = await mongoose.models.Messenger.findOne({
        $or: [
            { participants: user }
        ]
    }).populate('messages.sender').populate('messages.receiver').exec();

    if(currentChat){
        currentChat?.messages
    }

    return { chat,  user, buddy, currentChat };
}

export default function Chat() {
    const {chat, user, currentChat} = useLoaderData();
    const location = useLocation();

    const fetcher = useFetcher();
    const revalidate = useRevalidator();
    let textRef = useRef();
    let chatRef = useRef();

    useEffect(() => {
        if (fetcher.state === "submitting" && textRef.current) {
            textRef.current.value = "";

        }

        if(fetcher.state === "done" && chatRef.current){
            /* chatRef.current.scrollTop = chatRef.current.scrollHeight; */
        }

    }, [fetcher.state]);

    useEffect(() => {
        if (location.pathname.indexOf('/messenger') > -1) {
          const intervalId = setInterval(async () => {
            revalidate.revalidate();
          }, 1000);

          // Clear the interval when the component is unmounted or the path changes
          return () => clearInterval(intervalId);
        }
      }, [location.pathname, revalidate]);

    return (
        <div className="chatContainer-grid bg-slate-900" style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
            <div className="allChats">
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
            <section style={{height: "calc(100vh - 123px)", display: "grid", gridTemplateRows: "auto 1fr auto"}}>
                <header className="p-3 border-b-2 h-auto">
                    <h1 className="flex items-center text-3xl font-bold text-slate-50">
                        <img src={messengerIcon} alt="" className="w-7 h-7 mr-3 inline-block" />
                        Chat
                    </h1>
                </header>
                <MessageContainer messages={chat} user={user} ref={chatRef} />
                <footer>
                    <fetcher.Form method="post">
                        <fieldset disabled={fetcher.state === "submitting" ? true : false}>
                            <section className="chatContainer">
                                <input className="chat-input bg-slate-900 outline-none text-slate-300" ref={textRef} type="text" name="message" placeholder="Type a message" />
                                <button className="chat-button bg-slate-600 p-2 px-3 rounded-lg text-right text-slate-200" type="submit">Send</button>
                            </section>
                        </fieldset>
                    </fetcher.Form>
                </footer>
            </section>
        </div>
    );
}

export const action = async ({ params, request }) => {
    const user = await authenticator.isAuthenticated(request)

    if(!user){
        return redirect("/login");
    }

    const data = await request.formData();
    const message = data.get("message");
    if (!message) {
        return redirect("/messenger/" + params.id);
    }

    const currentChat = await mongoose.models.Messenger.findOne({
        $or: [
            { participants: user },
            { participants: params.id }
      ]});

    if(currentChat){
        currentChat.messages.push(
            {
                sender: user,
                receiver: params.id,
                message: message,
            }
        );

        try{
            await currentChat.save();
            return true;
        } catch (error) {
            console.error(error);
            return new Response(null, {
                status: 500,
                text: "Internal Server Error",
            });
        }
    }else{
        try{
            await mongoose.models.Messenger.create(
                {
                    chatId: params.id,
                    participants: [user, params.id],
                    messages: [
                        {
                            sender: user,
                            receiver: params.id,
                            message: message,
                        }
                    ]
                }
            );
            return true;
        }
        catch (error) {
            console.error(error);
            return new Response(null, {
                status: 500,
                text: "Internal Server Error",
            });
        }
    }
}

export function shouldRevalidate({
    currentUrl,
    actionData,
  }) {
    if(actionData && currentUrl.pathname.indexOf('/messenger') > -1){
        return true;
    }
  }