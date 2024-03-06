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
import { useState } from "react";

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
  const [openMenu, setOpenMenu] = useState(false);
  return (
    <header className="grid grid-cols-3 p-8 place-items-left text-slate-50 bg-slate-800">
        <Link to="/" className="flex place-items-center decoration-transparent"><h1 className="text-3xl font-thin uppercase italic font-serif">EventPlanner</h1></Link>
        <Form className="flex" method="post" onSubmit={handleSubmit}>
            <input className="px-3 text-slate-700 rounded-md" type="search" name="search" placeholder="Search" />
            <input className="px-3 text-slate-700 mx-2 rounded-md" type="datetime-local" name="date" />
            <button className="px-3 bg-slate-300 text-slate-600 rounded-md" name="_action" value="search" type="submit">Search</button>
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
        <section className="flex justify-end items-center flex-row text-right" >
            {
                user?.user ? <>
                    <Link className="flex items-center justify-center bg-slate-400 rounded-full w-10 h-10 text-4xl p-3 mr-4" to="/create">+</Link>
                    <section className="relative">
                      <button className="flex items-center text-right p-3" onClick={() => {
                        setOpenMenu(!openMenu)
                      }}>
                        {
                            user?.user?.image ?
                                <img className="profile-picture" src={user?.user?.image} alt={user?.user?.name} /> :
                                <img className="profile-picture" src="https://scontent-uc-d2c-7.intastellar.com/a/s/ul/p/avtr46-img/profile_standard.jpg" alt={user?.user?.name} />
                        }  
                        {user?.user?.name}
                      </button>
                      {
                          openMenu && 
                          <section className="w-max z-10 flex flex-col absolute top-20 right-0 bg-slate-800 text-slate-50 rounded-md overflow-hidden">
                              <Link onClick={() => setOpenMenu(!openMenu) } className="w-full text-right p-3 hover:bg-slate-400" to="/my-events">My Events</Link>
                              <Link className="w-full p-3 hover:bg-slate-400" onClick={() => setOpenMenu(!openMenu) } to={"/profile/" + user?.user?._id}>Profile</Link>
                              <Form className="inline" method="post">
                                <button className="w-full text-right p-4 hover:bg-slate-400" type="submit">Logout</button>
                              </Form>
                          </section>
                      }
                    </section>
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

function handleSubmit(event){
  /* event.preventDefault(); */
}