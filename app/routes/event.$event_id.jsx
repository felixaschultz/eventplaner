import { useLoaderData } from "@remix-run/react";
export function loader({params}){
    return {event: `Event ${params.event_id}`};
}

export default function Event(){
    const data = useLoaderData();
    return (
        <div className="p-8 text-slate-50 bg-slate-900">
            <h1 className="text-3xl font-bold">{data.event}</h1>
        </div>
    );
}