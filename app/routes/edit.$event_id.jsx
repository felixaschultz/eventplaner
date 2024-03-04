import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { mongoose } from "mongoose";
import { Form } from "@remix-run/react";
export async function loader({request, params}){
    await authenticator.isAuthenticated(request, {
        failureRedirect: "/login"
    });

    const eventId = new mongoose.Types.ObjectId(params.event_id);

    const event = await mongoose.models.Entry.findOne({_id: eventId});
    console.log(event);
    return {event: event};
}

export default function Event(){
    const {event} = useLoaderData();
    return (
        <div className="p-8 text-slate-50 bg-slate-900">
            <Form method="post">
                <fieldset>
                    <label htmlFor="title">Title</label>
                    <input className="block p-2 text-slate-500" type="text" id="title" name="title" defaultValue={event.title} />
                    <label htmlFor="description">Description</label>
                    <textarea className="block p-2 text-slate-500" id="description" name="description" defaultValue={event.description} />
                    <label htmlFor="date">Date</label>
                    <input className="block p-2 text-slate-500" type="datetime-local" id="date" name="date" defaultValue={event.date} />
                </fieldset>
                <button  className="bg-slate-300 p-3 px-11 mt-3" type="submit">Update Event</button>
            </Form>
        </div>
    );
}

export const action = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });

    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const eventId = new mongoose.Types.ObjectId(params.event_id);
    const userId = new mongoose.Types.ObjectId(user._id);
    
    data.useriD = userId;

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
};