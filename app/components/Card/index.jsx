import { Link, useLocation } from "@remix-run/react";

export default function Card({entry, user, children}) {
    const date = new Intl.DateTimeFormat("da-DK").format(new Date(entry.date));
    const pathname = useLocation().pathname;
    const formattedDate = `${date}`;
    const time = new Intl.DateTimeFormat("da-DK", {
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(entry.date));

    return (
        <section className="card p-8 rounded-md text-slate-50 bg-slate-900">
            <section>
                {user && user._id === entry.useriD && pathname === "/my-events" && (entry.public ? <p className="badge">Public</p> : <p className="badge">Private</p>)}
                {entry.image && (
                    <img onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                    }} src={entry.image} loading="lazy" alt={entry.title} className="w-full h-72 object-cover mb-2" />
                )}
                <h1 className="text-1xl font-bold">{entry.title}</h1>
                <p>{entry.description}</p>
                <time dateTime={entry.date}>{formattedDate} - { time }</time>
            </section>
            <section className="flex mt-5">
                <Link to={"/event/" + entry._id} className="bg-slate-600 rounded-md text-slate-200 px-6 py-1 mr-6">View details</Link>
                {user && user._id === entry.useriD && (
                    <Link className="bg-slate-600 rounded-md text-slate-200 px-6 py-1" to={`/event/${entry._id}/update`}>Edit</Link>
                )}
            </section>
            {
                children
            }
        </section>
    );
}