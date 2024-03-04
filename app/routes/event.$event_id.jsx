import { Form, useLoaderData, useFetcher } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";
import { useEffect, useRef } from "react";
export async function loader({params, request}){
    const user = await authenticator.isAuthenticated(request);
    const eventId = new mongoose.Types.ObjectId(params.event_id);

    const event = await mongoose.models.Entry.findOne({_id: eventId});
    if(!event || event.public === false && event.useriD != user?._id){
        throw new Response(null, {
            status: 404,
            text: "Not Found",
        });
    }

    return {event, user};
}

export default function Event(){
    const fetcher = useFetcher();
    const {event, user} = useLoaderData();
    const comment = useRef();
    const attending = event?.participant?.some((participant) => {
        return participant._id === user?._id;
    })

    useEffect(() => {
        if(comment.current && fetcher.state === "submitting"){
            comment.current.value = "";
        }
    }, [fetcher.state, comment]);

    return (
        <div className="grid grid-cols-2 gap-9 p-8 text-slate-50 bg-slate-900 min-h-full">
            <section>
                <h1 className="text-3xl font-bold">{event?.title}</h1>
                <p>{event?.description}</p>
                <article>
                    <h2 className="text-2xl font-bold">Comments</h2>
                    {
                        user && (
                            <fetcher.Form method="post">
                                <fieldset disabled={fetcher.state === "submitting" ? true : false}>
                                    <textarea ref={comment} className="block p-2 text-slate-500" id="comment" name="comment" />
                                </fieldset>
                                <button className="bg-slate-600 p-3 px-11 mt-3" name="_action" value="comment" type="submit">Add Comment</button>
                            </fetcher.Form>
                        )
                    }
                    {
                        event?.comment?.map((comment, key) => {
                            return (
                                <>
                                    <p key={key}>{comment.comment}</p>
                                    <p>- {comment.name}</p>
                                </>
                            );
                        })
                    }
                </article>
            </section>
            <section>
                <h2 className="text-3xl font-bold">{new Date(event?.date).toLocaleString("da-DK")}</h2>
                <h3>Place: {event?.place}</h3>
                <section className="mt-5">
                    <h3 className="text-xl font-bold">Attendancies</h3>
                    <p>Total: {event?.participant.length == undefined ? "0" : event?.participant.length}</p>
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
    const formData = await request.formData();
    const { _action } = Object.fromEntries(formData);

    if(_action === "attend"){
        return await mongoose.models.Entry.findOneAndUpdate(eventId, {
            $push: {
                participant: {
                    _id: userId,
                    name: user.name,
                },
            },
        });
    }else if (_action === "comment"){
        const { comment } = Object.fromEntries(formData);
        return await mongoose.models.Entry.findOneAndUpdate(eventId, {
            $push: {
                comment: {
                    _id: userId,
                    name: user.name,
                    comment,
                },
            },
        });
    
    }
    
};

function handleSubmit(e){
    if (!confirm("You are about to attend this event. Are you sure?")) {
        e.preventDefault();
    }
}