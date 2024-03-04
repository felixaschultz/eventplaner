import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <div className="grid grid-cols-2 p-8 text-slate-50 bg-slate-900">
        <h1 className="text-3xl font-bold">Event Planer</h1>
        <Link to="/login">Login</Link>
    </div>
  );
}