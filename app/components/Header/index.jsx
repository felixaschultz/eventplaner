import { Form, Link } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export default function Header({user}) {
  return (
    <div className="grid grid-cols-2 p-8 align-middle text-slate-50 bg-slate-800">
        <Link to="/" className="decoration-transparent"><h1 className="text-3xl font-bold">Event Planer</h1></Link>
        <section className="text-right" >
            {
                user?.user ? <>
                    <Link className="text-right p-5" to="/my-events">My Events</Link>
                    <Link className="text-right p-5" to="/create">Create Event</Link>
                    <Link className="text-right p-5" to="/profile">{user?.user?.name}</Link>
                    <Form className="inline" method="post">
                        <button className="text-right p-4" type="submit">Logout</button>
                    </Form>
                </>
                :
                <>
                    <Link className="text-right p-8" to="/login">Login</Link>
                    <Link className="text-right p-8" to="/signup">Signup</Link>
                </>
            }
        </section>
    </div>
  );
}