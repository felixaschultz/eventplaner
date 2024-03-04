import {
  Links,
  Link,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useFetcher,
  useActionData,
  json
} from "@remix-run/react";
import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import styles from "./tailwind.css";
import { authenticator } from "./services/auth.server";
import mongoose from "mongoose";
import { Form } from "react-router-dom";

export const links = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export function meta() {
  return [{ title: "Event Planer" }];
}

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request);

  return { user };
}

export default function App() {
  const user = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header user={user} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export async function action({request}){
  const formData = await request.formData();
  const {_action, search, date} = Object.fromEntries(formData);
  if(_action === "search"){
    const q = search;
    const events = await mongoose.models.Entry.find({
      $or: [
        { title: { $regex: new RegExp(q), $options: 'i' } },
        { description: { $regex: new RegExp(q), $options: 'i' } },
        { place: { $regex: new RegExp(q), $options: 'i' } },
        { date: { $gte: date } }
      ],
      public: true
    });
    return json(events);
  }else{
    await authenticator.logout(request, {
      redirectTo: "/login",
    });
  }
}

export function ErrorBoundary() {
  let error = useRouteError();
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        <section className="flex h-full flex-col items-center justify-center">
          <p className="text-3xl">Whoops!</p>
          {isRouteErrorResponse(error) ? (
            <p>
              {error.status} – {error.statusText}
            </p>
          ) : error instanceof Error ? (
            <p>{error.message}</p>
          ) : (
            <p>Something happened.</p>
          )}
          <Link to="/">Go back home</Link>
        </section>
        <Scripts />
      </body>
    </html>
  );
}

function Header({ user }) {
  let events = useActionData();
  return (
    <header className="grid grid-cols-3 p-8 place-items-left text-slate-50 bg-slate-800">
        <Link to="/" className="flex place-items-center decoration-transparent"><h1 className="text-3xl font-bold">Event Planer</h1></Link>
        <Form className="flex" method="post">
            <input className="p-2 text-slate-700" type="search" name="search" placeholder="Search" />
            <input className="p-2 text-slate-700 mx-2" type="datetime-local" name="date" />
            <button className="p-2 bg-slate-300 text-slate-600 rounded-md" name="_action" value="search" type="submit">Search</button>
            {
                !events ? null : 
                <section className="search-container">
                    {
                        events?.map((event) => {
                            return (
                                <Link className="search-item" to={`/event/${event._id}`} key={event._id}>
                                    {event.title}
                                </Link>
                            );
                        })
                    }
                </section>
            }
        </Form>
        <section className="text-right" >
            {
                user?.user ? <>
                    <Link className="text-right p-5" to="/my-events">My Events</Link>
                    <Link className="text-right p-5" to="/create">Create Event</Link>
                    {/* <Link className="text-right p-5" to="/profile">{user?.user?.name}</Link> */}
                    <Form className="inline" method="post">
                        <button className="text-right p-4" type="submit">Logout</button>
                    </Form>
                </>
                :
                <>
                    <Link className="inline-block w-max bg-slate-400 text-right px-8 py-3 rounded-md" to="/login">Login</Link>
                    <Link className="inline-block w-max text-right px-8 py-3" to="/signup">Signup</Link>
                </>
            }
        </section>
    </header>
  );
}