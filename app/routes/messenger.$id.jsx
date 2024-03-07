import { useLoaderData, useFetcher, Form, redirect, useNavigate } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useRevalidator } from "@remix-run/react";
import MessageContainer from "~/components/MessengerContainer";
import { authenticator } from "~/services/auth.server";

import moment from "moment";
import mongoose from "mongoose";
import "../Styles/chat.css";

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

    let [chat] = await mongoose.models.Messenger.find({ chat_id: id }).sort({ date: 1 });

    if(chat === undefined){
        console.log("Chat not found");
        return new Response(null, {
            status: 404,
            text: "Chat not found",
        });
    }

    chat = chat.map((message) => {
        message.date = moment(message.date).format("YYYY-MM-DD HH:mm:ss");
        return message;
    });

    chat.forEach((message) => {
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

    const chatUser = chat.find(element => element.user !== user).user;

    return { chat,  chatUser };
}

export default function Chat() {
    const {chat, user} = useLoaderData();

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
        setInterval(() => {
            /* revalidate.revalidate(); */
        }, 1000);
    }, []);

    return (
        <div className="chatContainer-grid" style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
            <header className="chat-header">
                <h1>{ user }</h1>
            </header>
            <MessageContainer messages={chat} ref={chatRef} />
            <footer>
                <fetcher.Form method="post">
                    <fieldset disabled={fetcher.state === "submitting" ? true : false}>
                        <section className="chatContainer">
                            <input className="chat-input" ref={textRef} type="text" name="message" placeholder="Type a message" />
                        </section>
                    </fieldset>
                </fetcher.Form>
            </footer>
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
    const username = user;
    if (!message) {
        return redirect("/messenger/" + params.id);
    }
    
    const newMessage = await mongoose.models.Messenger.create(
        params.id,
        username,
        message
    );

    if(newMessage){
        return  {chat_id: params.id, user: username, message: message, date: new Date() };
    }
}