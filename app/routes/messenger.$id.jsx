import { useLoaderData, useFetcher, redirect, useLocation } from "@remix-run/react";
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

    return { chat,  user };
}

export default function Chat() {
    const {chat, user} = useLoaderData();
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
            <header className="p-3">
                <h1 className="text-3xl font-bold text-slate-50">Chat</h1>
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