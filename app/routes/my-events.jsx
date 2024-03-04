import mongoose from 'mongoose';
import {authenticator} from '../services/auth.server';
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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
        <h2>Events I´m attending</h2>
        <section>
            {myEvents?.map((entry) => (
                <Link to={`/event/${entry._id}`} key={entry._id}>
                    <Card key={entry._id} entry={entry} user={user} />
                </Link>
            ))}
        </section>
      </div>
    );
}
  