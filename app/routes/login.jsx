import { Form } from "@remix-run/react";
import "../Styles/login-signup.css";
import { useLoaderData } from "@remix-run/react";
import Input from "~/components/InputFields";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { authenticator } from "../services/auth.server";
import { getSession, commitSession } from "../services/session.server";

import { json } from "@remix-run/node";

export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  const session = await getSession(request.headers.get("Cookie"));

  const error = session.get("sessionErrorKey");
  session.unset("sessionErrorKey");

  const headers = new Headers({
    "Set-Cookie": await commitSession(session),
  });

  return json({ error }, { headers });
}

export default function Login() {
  const loaderData = useLoaderData();
  return (
    <div className="grid place-content-center p-8 text-slate-50 bg-slate-900 min-h-full">
        <h1 className="text-3xl font-bold">Login</h1>
        <Form method="post">
            <div className="mb-4">
                <label htmlFor="email">Email</label>
                <Input type="email" id="email" name="mail" />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <Input type="password" id="password" name="password" />
            </div>
            <div className="error-message">{loaderData?.error ? <p>{loaderData?.error?.message}</p> : null}</div>
            <div>
                <button className="bg-slate-200 text-slate-600 w-full p-3 px-11 mt-3" type="submit">Login</button>
            </div>
        </Form>
    </div>
  );
}

export async function action({request}){
    return await authenticator.authenticate("user-pass", request, {
        successRedirect: "/my-events",
        failureRedirect: "/login"
    });
}