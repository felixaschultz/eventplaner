import { Link } from "@remix-run/react";

export default function Card({entry, user}) {
    const date = new Intl.DateTimeFormat("da-DK").format(new Date(entry.date));

    const formattedDate = `${date}`;
    const time = new Intl.DateTimeFormat("da-DK", {
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(entry.date));

    return (
        <div className="card p-8 text-slate-50 bg-slate-900">
            <p>{entry.public ? "Public" : "Private"}</p>
            <h1 className="text-1xl font-bold">{entry.title}</h1>
            <p>{entry.description}</p>
            <time dateTime={entry.date}>{formattedDate} - { time }</time>
            {user && user._id === entry.useriD && (
                <Link to={`/edit/${entry._id}`}>Edit</Link>
            )}
        </div>
    );
}