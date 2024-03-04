import mongoose from 'mongoose';
import {authenticator} from '../services/auth.server';
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import Card from "../components/Card";

export const meta = () => {
    return [
        {
            title: "My Events | Event Planer"
        }
    ];
}
export async function loader({ request }) {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login"
    });
    const userId = new mongoose.Types.ObjectId(user?._id);
  
    const entries = await mongoose.models.Entry.find({
        useriD: userId
    }).sort({ date: -1 });

    const myEvents = (await mongoose.models.Entry.find().sort({ date: -1 })).filter((entry) => {
        return entry.participant.some((participant) => {
            return participant._id.equals(userId);
        });
    });

    return json({ entries, user, myEvents });
}

export default function MyEvents() {
    const { entries, user, myEvents } = useLoaderData();
    return (
      <div className="p-8 text-slate-50 bg-slate-900">
        <h1 className="text-3xl font-bold">My Events</h1>
        <section className="grid grid-cols-2 gap-4">
          {entries.map((entry) => (
            <Link to={`/event/${entry._id}`} key={entry._id}>
              <Card key={entry._id} entry={entry} user={user} />
            </Link>
          ))}
        </section>
        <section className='mt-8'>
            <h2 className='text-2xl font-bold mb-3'>Events I´m attending</h2>
            {myEvents?.map((entry) => (
                <>
                    <article>
                        <Link to={`/event/${entry._id}`} key={entry._id}>
                            <Card key={entry._id} entry={entry} user={user} />
                        </Link>
                        <section>
                            <h2 className='text-2xl font-bold'>Danger Zone</h2>
                            <Form className='p-3' method="post" onSubmit={handleSubmit}>
                                <input type="hidden" name="event_Id" value={entry._id} />
                                <button className='bg-red-500 text-slate-100 p-3 rounded-md' name="_action" value="unattend">Unattend</button>
                            </Form>
                        </section>
                    </article>
                </>
            ))}
        </section>
      </div>
    );
}

export const action = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    const userId = new mongoose.Types.ObjectId(user._id);
    const formData = await request.formData();
    const { _action, event_Id } = Object.fromEntries(formData);
    const eventId = new mongoose.Types.ObjectId(event_Id);
    
    if(_action === "unattend"){
        return await mongoose.models.Entry.findOneAndUpdate(eventId, {
            $pull: {
                participant: {
                    _id: userId,
                },
            },
        });
    }
};
 
function handleSubmit(e){
    if (!confirm("You are about to unattend this event, are you sure?")) {
        e.preventDefault();
    }
}