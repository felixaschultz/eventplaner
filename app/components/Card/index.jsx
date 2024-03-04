import "./Style.css";
export default function Card({entry}) {
    
    return (
        <div className="card p-8 text-slate-50 bg-slate-900">
            <h1 className="text-1xl font-bold">{entry.title}</h1>
            <p>{entry.description}</p>
            <time>{entry.date}</time>
        </div>
    );
}