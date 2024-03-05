import { Form } from "@remix-run/react";
import "../Styles/login-signup.css";
import mongoose from "mongoose";
import { sessionStorage, commitSession } from "~/services/session.server";

export const meta = () => {
    return [{ title: "Signup" }];
};

export default function Signup() {
    return (
        <div className="p-8 text-slate-50 bg-slate-900">
            <h1 className="text-3xl font-bold">Signup</h1>
            <Form method="post">
                <div>
                    <label htmlFor="username">Name</label>
                    <input className="block p-2 text-slate-500" type="text" id="username" name="name" />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input className="block p-2 text-slate-500" type="email" id="email" name="mail" />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input className="block p-2 text-slate-500" type="password" id="password" name="password" />
                </div>
                <div>
                    <button className="bg-slate-300 p-3 px-11 mt-3" type="submit">Signup</button>
                </div>
            </Form>
        </div>
    );
}

export async function action({request}){
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const NewUser = await mongoose.models.Account.create(data);

    if(!NewUser){
        return {
            status: 500,
            body: "Error creating user",
        };
    }

    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", NewUser._id);
    await commitSession(session);

    if(NewUser){
        return {
            status: 302,
            headers: {
                location: "/my-events",
            },
        };
    }
    
}