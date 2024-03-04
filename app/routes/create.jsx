import { Form } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import mongoose from "mongoose";
import { useFetcher } from "react-router-dom";

export const loader = async ({ request }) => {
    await authenticator.isAuthenticated(request, {
        failureRedirect: "/login"
    });
    return "";
};

export default function Create(){
    const fetcher = useFetcher();
    return (
        <div className="p-8 text-slate-50 bg-slate-900">
            <h1 className="text-3xl font-bold">Create Event</h1>
            <fetcher.Form method="post">
                <fieldset disabled={(fetcher.state === "submitting") ? true : false}>
                    <label htmlFor="title">Title</label>
                    <input className="block p-2 text-slate-500" type="text" id="title" name="title" />
                    <label htmlFor="description">Description</label>
                    <textarea className="block p-2 text-slate-500" id="description" name="description" />
                    <label htmlFor="date">Date</label>
                    <input className="block p-2 text-slate-500" type="datetime-local" id="date" name="date" />
                </fieldset>
                <button  className="bg-slate-300 p-3 px-11 mt-3" type="submit">Create Event</button>
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
    }
};