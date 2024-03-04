import { Link } from "@remix-run/react";

export default function Header({user}) {

  return (
    <div className="grid grid-cols-2 p-8 text-slate-50 bg-slate-800">
        <Link to="/" className="decoration-transparent"><h1 className="text-3xl font-bold">Event Planer</h1></Link>
        <section className="text-right" >
            {
                user ? 
                <Link className="text-right p-8" to="/profile">Profile</Link>
                :
                <>
                    <Link className="text-right p-8" to="/login">Login</Link>
                    <Link className="text-right p-8" to="/signup">Signup</Link>
                </>
            }
        </section>
    </div>
  );
}