import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";
export async function loader({params, request}){
    const user = await authenticator.isAuthenticated(request);
    const eventId = new mongoose.Types.ObjectId(params.event_id);

    const event = await mongoose.models.Entry.findOne({_id: eventId});
    console.log(event);
    if(!event || event.public === false){
        throw new Response(null, {
            status: 404,
            text: "Not Found",
        });
    }

    return {event, user};
}

export default function Event(){
    const {event} = useLoaderData();
    return (
        <div className="p-8 text-slate-50 bg-slate-900">
            <h1 className="text-3xl font-bold">{event?.title}</h1>
        </div>
    );
}