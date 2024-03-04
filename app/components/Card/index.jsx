import { Link, useLocation } from "@remix-run/react";

export default function Card({entry, user}) {
    const date = new Intl.DateTimeFormat("da-DK").format(new Date(entry.date));
    const pathname = useLocation().pathname;
    const formattedDate = `${date}`;
    const time = new Intl.DateTimeFormat("da-DK", {
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(entry.date));

    return (
        <div className="card p-8 rounded-md text-slate-50 bg-slate-900">
            <p>{user && user._id === entry.useriD && pathname === "/my-events" && (entry.public ? "Public" : "Private")}</p>
            <h1 className="text-1xl font-bold">{entry.title}</h1>
            <p>{entry.description}</p>
            <time dateTime={entry.date}>{formattedDate} - { time }</time>
            {user && user._id === entry.useriD && (
                <Link className="bg-slate-600 rounded-md text-slate-200 px-6 py-1" to={`/edit/${entry._id}`}>Edit</Link>
            )}
        </div>
    );
}