import { Form, useLoaderData, useFetcher, Link } from "@remix-run/react";
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
                <div className="flex justify-between place-content-end mb-3">
                    <h1 className="text-3xl font-bold">{event?.title}</h1>
                    {
                        event?.useriD === user?._id && (
                            <Link className="w-max bg-slate-500 block rounded-md text-slate-200 px-6 py-1" to={"/edit/" + event._id}>Edit event</Link>
                        )
                    }
                </div>
                <p>{event?.description}</p>
                <article className="mt-10 border-t-2 border-t-slate-300">
                    <h2 className="text-xl font-bold my-3">{event?.comment?.length} Comments</h2>
                    {
                        <fetcher.Form className="mb-15" method="post">
                            <fieldset className="disabled:opacity-50" disabled={fetcher.state === "submitting" || !user ? true : false}>
                                <textarea ref={comment} className="w-full bg-slate-400 block p-2 placeholder:text-slate-600 text-slate-700 rounded-md" id="comment" name="comment" placeholder="Write a comment" />
                                <section className="grid place-content-end">
                                    <button className="bg-slate-600 p-2 px-3 rounded-lg text-right mt-3" name="_action" value="comment" type="submit">Comment</button>
                                </section>
                            </fieldset>
                        </fetcher.Form>
                    }
                    {
                        (event?.comment && event?.comment.length > 0) ? event?.comment.sort((a,b) => {
                            return new Date(b.date) - new Date(a.date);
                        }).map((comment, key) => {
                            const date = new Date(comment.date).toLocaleString("da-DK");
                            return (
                                <section key={key} className="mt-8">
                                    <p className="block w-full bg-slate-200 text-slate-500 p-3 rounded-md mt-3">{comment.comment}</p>
                                    <h3 className="text-l font-bold">{comment.name}, <span className="font-thin">{date}</span></h3>
                                </section>
                            );
                        }) : <p>No comments yet</p>
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
                    event?.participant.length > 0 &&
                    <section className="mt-5">
                        <h3 className="text-xl font-bold">List of Participants</h3>
                        <ul className="list-inside">
                            {
                                event?.participant.map((participant) => {
                                    return (
                                        <li className="block py-3 pl-5" key={participant._id}>{user && participant?._id === user?._id ? "You" : participant.name}</li>
                                    );
                                })
                            }
                        </ul>
                    </section>
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

        if(comment === "" || comment === null || comment === undefined){
            return new Response(null, {
                status: 400,
                text: "Comment cannot be empty",
            });
        }

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