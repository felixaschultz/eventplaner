import { Form, useLoaderData, useFetcher, Link } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";
import { useEffect, useRef } from "react";
import Map from "../components/Map";

async function findUser(userId) {
    const user = await mongoose.models.Account.findOne({_id: userId});
    return user;
}

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

    const newCommentArray = event.comment.map(async (comment) => {
        const user = await findUser(comment._id);
        comment.user = user;
        return comment;
    });

    const attendancies = event.participant.map(async (comment) => {
        const user = await findUser(comment._id);
        comment.user = user;
        return comment;
    });

    event.comment = await Promise.all(newCommentArray);
    event.participant = await Promise.all(attendancies);
    
    return { event, user };
}

export const meta = ({data}) => {
    return [
        {
            title: data.event.title + " | Event Planer"
        }
    ]
};

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
                {
                    event?.image && (
                        <img className="w-full h-72 mb-3 object-cover" src={event?.image} alt={event?.title} />
                    )
                }
                <div className="flex justify-between items-center mb-3">
                    <h1 className="text-2xl font-bold">{event?.title}</h1>
                    {
                        event?.useriD === user?._id && (
                            <Link className="w-max bg-slate-500 block rounded-md text-slate-200 px-6 py-1" to={"/event/" + event._id + "/update"}>Edit</Link>
                        )
                    }
                </div>
                <p>{event?.description}</p>
                <article className="mt-10 border-t-2 border-t-slate-400">
                {event.public === true && (
                    <>
                        <h2 className="text-xl font-bold my-3">{event?.comment?.length} Comments</h2>
                        <fetcher.Form className="mb-15" method="post">
                            <fieldset className="disabled:opacity-50 disabled:cursor-not-allowed" disabled={fetcher.state === "submitting" || !user ? true : false}>
                                <textarea ref={comment} className="w-full bg-slate-400 block p-2 placeholder:text-slate-600 text-slate-700 rounded-md disabled:cursor-not-allowed" id="comment" name="comment" placeholder="Write a comment" />
                                <section className="grid place-content-end">
                                    <button className="bg-slate-600 p-2 px-3 rounded-lg text-right mt-3 disabled:cursor-not-allowed" name="_action" value="comment" type="submit">Comment</button>
                                </section>
                            </fieldset>
                        </fetcher.Form>
                    </>
                )}
                    {
                        (event?.comment && event?.comment.length > 0) ? event?.comment.sort((a,b) => {
                            return new Date(b.date) - new Date(a.date);
                        }).map((comment, key) => {
                            const date = new Date(comment.date).toLocaleString("de-DE");
                            return (
                                <section key={key} className="mt-8">
                                    <p className="block w-full bg-slate-200 text-slate-500 p-3 rounded-md mt-3">{comment.comment}</p>
                                    <h3 className="font-medium">{(comment.user.image) ? <img alt="" src={comment?.user?.image} />: null}{comment.user.name}, <span className="font-thin">{date}</span></h3>
                                </section>
                            );
                        }) : <p>No comments yet</p>
                    }
                </article>
            </section>
            <section>
                <h2 className="text-3xl font-bold">{new Date(event?.date).toLocaleString("de-DE")}</h2>
                <h3 className="text-xl mb-2">Place: {event?.place}</h3>
                <Map place={event?.place} />
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
                                        <li className="block py-3 pl-5" key={participant._id}>{
                                            (user && participant?._id === user?._id) ?  
                                                (participant.user.image) ? <img alt="" src={participant?.user?.image} /> + "You"
                                                    : participant.name + " (You)"
                                                    : (participant.user.image) ? <img alt="" src={participant?.user?.image} /> 
                                                        + participant.name
                                                        : "" + participant.name}
                                        </li>
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