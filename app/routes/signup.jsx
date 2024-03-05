import { Form } from "@remix-run/react";
import "../Styles/login-signup.css";
import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";

export const meta = () => {
    return [{ title: "Signup" }];
};

export default function Signup() {
    return (
        <div className="grid place-content-center p-8 text-slate-50 bg-slate-900 min-h-full">
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
                <button className="bg-slate-200 text-slate-600 w-full p-3 px-11 mt-3" type="submit">Signup</button>
                </div>
            </Form>
        </div>
    );
}

export async function action({request}){
    const rawBody = await request.text();
    const formData = new URLSearchParams(rawBody);
    const data = Object.fromEntries(formData);
    const formData2 = await request.formData();


    const NewUser = await mongoose.models.Account.create(data);

    if(!NewUser){
        return {
            status: 500,
            body: "Error creating user",
        };
    }
    if(NewUser){
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/login",
            },
        });
        /* console.log(data);
        const modifiedRequest = new Request(request, { body: Object.fromEntries(formData2) });
        return await authenticator.authenticate("user-pass", modifiedRequest, {
            successRedirect: "/my-events",
            failureRedirect: "/login"
        }); */
    }
}