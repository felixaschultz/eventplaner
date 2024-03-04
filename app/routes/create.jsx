import { Form } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import mongoose from "mongoose";
import { useFetcher } from "react-router-dom";
import { useActionData } from "@remix-run/react";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
    await authenticator.isAuthenticated(request, {
        failureRedirect: "/login"
    });
    return "";
};

export default function Create(){
    const fetcher = useFetcher();
    const actionData = useActionData();
    return (
        <div className="p-8 text-slate-50 bg-slate-900 min-h-full">
            <fetcher.Form className="w-1/2 m-auto" method="post">
                <h1 className="text-3xl font-bold">Create Event</h1>
                <fieldset className="grid grid-cols-2 gap-4" disabled={(fetcher.state === "submitting") ? true : false}>
                    <section>
                        <label htmlFor="title">Title</label>
                        <input className="block w-full p-2 text-slate-500" type="text" id="title" name="title" />
                    </section>
                    <section>
                        <label htmlFor="description">Description</label>
                        <textarea className="block w-full p-2 text-slate-500" id="description" name="description" />
                    </section>
                    <section>
                        <label htmlFor="place">Place</label>
                        <input className="block w-full p-2 text-slate-500" type="text" id="place" name="place" />
                    </section>
                    <section>
                        <label htmlFor="date">Date</label>
                        <input className="block w-full p-2 text-slate-500" type="datetime-local" id="date" name="date" />
                    </section>
                </fieldset>
                <div className="error-message">{actionData?.error ? <p>{actionData?.error?.message}</p> : null}</div>
                <button  className="bg-slate-600 p-3 px-11 mt-3" type="submit">Create Event</button>
            </fetcher.Form>
        </div>
    );
}

export const action = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });

    
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    if(!data.title || !data.description || !data.place || !data.date){
        return json({ error: "All fields are required" }, {
            status: 400,
        });
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    data.useriD = userId;

    const NewEvent = await mongoose.models.Entry.create(data);

    if(NewEvent){
        return new Response(null, {
            status: 302,
            headers: {
                location: "/my-events",
            },
        });
    }else{
        return new Response(null, {
            status: 500,
            body: "Error creating event",
        });
    }
};