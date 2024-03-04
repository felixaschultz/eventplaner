import { Form, useLoaderData } from "@remix-run/react";
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
    const {event, user} = useLoaderData();
    const attending = event?.participant?.some((participant) => {
        return participant._id === user?._id;
    })

    return (
        <div className="grid grid-cols-2 gap-9 p-8 text-slate-50 bg-slate-900">
            <section>
                <h1 className="text-3xl font-bold">{event?.title}</h1>
                <p>{event?.description}</p>
            </section>
            <section>
                <h2 className="text-3xl font-bold">{new Date(event?.date).toLocaleString("da-DK")}</h2>
                <h3>Place: {event?.place}</h3>
                <section className="mt-5">
                    <h3 className="text-xl font-bold">Attendancies</h3>
                    <p>Total: {event?.participant.lenght == undefined ? "0" : event?.participant.lenght}</p>
                    {!attending && (
                    <Form className="mt-1" method="post" onSubmit={handleSubmit}>
                        {
                            user && event?.useriD !== user?._id && (
                                <button className="bg-slate-100 rounded-md text-slate-600 px-7 py-2" name="_action" value="attend">Attend</button>
                            )
                        }
                    </Form>
                    )}
                </section>
                {
                    event?.participant.map((participant) => {
                        return (
                            <p className="" key={participant._id}>{user && participant?._id === user?._id ? "You" : participant.name}</p>
                        );
                    })
                }
            </section>
        </div>
    );
}

export const action = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request);
    const eventId = new mongoose.Types.ObjectId(params.event_id);
    const userId = new mongoose.Types.ObjectId(user._id);
    
    await mongoose.models.Entry.findOneAndUpdate(eventId, {
        $push: {
            participant: {
                _id: userId,
                name: user.name,
            },
        },
    });

    return new Response(null, {
        status: 302,
        headers: {
            location: `/event/${params.event_id}`,
        },
    });
};

function handleSubmit(e){
    if (!confirm("You are about to attend this event. Are you sure?")) {
        e.preventDefault();
    }
}