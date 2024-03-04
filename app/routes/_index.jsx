import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";

export async function loader() {
  const entries = await mongoose.models.Entry.find({});
  return json({ entries });
}

export default function Index() {
  const { entries } = useLoaderData();

  return (
    <div className="p-8 text-slate-50 bg-slate-900">
      <h1 className="text-3xl font-bold">Entries</h1>
      <ul>
        {entries.map((entry) => (
          <li key={entry._id}>{entry.text}</li>
        ))}
      </ul>
    </div>
  );
}
