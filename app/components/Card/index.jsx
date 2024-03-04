import "./Style.css";
import moment from "moment";
export default function Card({entry}) {
    const date = moment(entry.date).format("MMMM Do, YYYY");
    const time = moment(entry.date).format("h:mm a");

    const formattedDate = `${date} at ${time}`;

    return (
        <div className="card p-8 text-slate-50 bg-slate-900">
            <h1 className="text-1xl font-bold">{entry.title}</h1>
            <p>{entry.description}</p>
            <time>{formattedDate}</time>
        </div>
    );
}