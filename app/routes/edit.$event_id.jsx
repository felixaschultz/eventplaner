import { useLoaderData, useFetcher } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { mongoose } from "mongoose";
import { Form } from "@remix-run/react";
export async function loader({request, params}){
    await authenticator.isAuthenticated(request, {
        failureRedirect: "/login"
    });

    const eventId = new mongoose.Types.ObjectId(params.event_id);

    const event = await mongoose.models.Entry.findOne({_id: eventId});
    return {event: event};
}

export default function Event(){
    const {event} = useLoaderData();
    const fetcher = useFetcher();
    const defaultDate = new Date(event.date).toISOString().slice(0, 16);

    return (
        <div className="p-8 text-slate-50 bg-slate-900 min-h-full">
            <section className="w-1/2 m-auto">
                <h1 className="text-3xl font-bold">Edit Event: {event.title}</h1>
                <Form className="my-5" method="post" onSubmit={handleSubmit}>
                    <button className="bg-red-600 mx-2 rounded-md text-slate-200 px-6 py-1" name="_action" value="delete">Delete Event</button>
                    <button className="bg-slate-500 mx-2 rounded-md text-slate-200 px-6 py-1" name="_action" value="public">Make { event.public ? "Private": "Public" }</button>
                </Form>
                <fetcher.Form method="post">
                    <fieldset className="grid grid-cols-2 gap-4" disabled={fetcher.state === "submitting" ? true : false}>
                        <section>
                            <label htmlFor="title">Title</label>
                            <input className="w-full block p-2 text-slate-500" type="text" id="title" name="title" defaultValue={event.title} />
                        </section>
                        <section>
                            <label htmlFor="description">Description</label>
                            <textarea className="w-full block p-2 text-slate-500" id="description" name="description" defaultValue={event.description} />
                        </section>
                        <section>
                            <label htmlFor="place">Place</label>
                            <input className="w-full block p-2 text-slate-500" type="text" id="place" name="place" defaultValue={event.place} />
                        </section>
                        <section>
                            <label htmlFor="date">Date</label>
                            <input className="w-full block p-2 text-slate-500" type="datetime-local" id="date" name="date" defaultValue={defaultDate} />
                        </section>
                        <button  className="bg-slate-600 p-3 px-11 mt-3" type="submit">Update Event</button>
                    </fieldset>
                </fetcher.Form>
            </section>
        </div>
    );
}

export const action = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });

    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const { _action } = Object.fromEntries(formData);
    const eventId = new mongoose.Types.ObjectId(params.event_id);
    const userId = new mongoose.Types.ObjectId(user._id);
    data.useriD = userId;

    if(_action === "public"){
        const entry = await mongoose.models.Entry.findById(eventId);
        entry.public = !entry.public;
        await entry.save();
        return new Response(null, {
            status: 302,
            headers: {
                location: "/my-events",
            },
        });
    }else if(_action === "delete"){

        await mongoose.models.Entry.findByIdAndDelete(params.event_id);
        return new Response(null, {
            status: 302,
            headers: {
                location: "/my-events",
            },
        });
    }else{
        const updatedEvent = await mongoose.models.Entry.updateOne(
            {_id: eventId},
            data
        );
    
        if(updatedEvent){
            return new Response(null, {
                status: 302,
                headers: {
                    location: "/my-events",
                },
            });
        }
    }
};

function handleSubmit(e){
    if (!confirm("Are you sure?")) {
        e.preventDefault();
    }
}