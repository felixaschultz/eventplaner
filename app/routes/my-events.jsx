import mongoose from 'mongoose';
import {authenticator} from '../services/auth.server';
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Card from "../components/Card";

export async function loader({ request }) {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login"
    });
    const userId = new mongoose.Types.ObjectId(user?._id);
  
    const entries = await mongoose.models.Entry.find({
        useriD: userId
    }).sort({ date: -1 });
    return json({ entries });
}

export default function MyEvents() {
    const { entries } = useLoaderData();
  
    return (
      <div className="p-8 text-slate-50 bg-slate-900">
        <h1 className="text-3xl font-bold">My Events</h1>
        <section className="grid grid-cols-2">
          {entries.map((entry) => (
            <Card key={entry._id} entry={entry} />
          ))}
        </section>
      </div>
    );
}
  