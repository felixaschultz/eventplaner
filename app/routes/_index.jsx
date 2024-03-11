import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Card from "../components/Card";
import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request);

  const entries = await mongoose.models.Entry.find({
    public: true,
  });
  return json({ entries, user });
}

export default function Index() {
  const { entries, user } = useLoaderData();
  return (
    <div className="p-8 text-slate-50 bg-slate-900 min-h-full">
      <h1 className="text-3xl font-bold">Events</h1>
      <section className="grid lg:grid-cols-2 sm:grid-cols-1 md:grid-cols-1 gap-4">
        {entries.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        }).map((entry) => (
          <Card key={entry._id} entry={entry} user={user} />
        ))}
      </section>
    </div>
  );
}
