import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";
export async function loader({params, request}){
    const user = await authenticator.isAuthenticated(request);
    const eventId = new mongoose.Types.ObjectId(params.event_id);

    const event = await mongoose.models.Entry.findOne({_id: eventId});
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
        <div className="grid grid-cols-2 gap-9 p-8 text-slate-50 bg-slate-900">
            <section>
                <h1 className="text-3xl font-bold">{event?.title}</h1>
                <p>{event?.description}</p>
            </section>
            <section>
                <h2 className="text-3xl font-bold">{new Date(event?.date).toLocaleString("da-DK")}</h2>
                <h3>Attendancies</h3>
                {
                    event?.attendances?.map((attendance) => (
                        <p key={attendance._id}>{attendance.useriD}</p>
                    ))
                }
            </section>
        </div>
    );
}