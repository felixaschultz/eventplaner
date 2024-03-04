import { Form, Link, useActionData } from "@remix-run/react";


export default function Header({user}) {
    const event = useActionData();
  return (
    <div className="grid grid-cols-3 p-8 align-middle text-slate-50 bg-slate-800">
        <Link to="/" className="decoration-transparent"><h1 className="text-3xl font-bold">Event Planer</h1></Link>
       <Form method="POST">
            <input className="p-2 text-slate-700" type="search" name="search" placeholder="Search" />
            <button name="_action" value="search" type="submit">Search</button>
            {
                !event ? null : event.map((entry) => {
                    return <>
                        <Link className="search-item" to={`/event/${entry._id}`} key={entry._id}>
                            <p>{entry.title}</p>
                        </Link>
                    </>
                })
            }
       </Form>
        <section className="text-right" >
            {
                user?.user ? <>
                    <Link className="text-right p-5" to="/my-events">My Events</Link>
                    <Link className="text-right p-5" to="/create">Create Event</Link>
                    {/* <Link className="text-right p-5" to="/profile">{user?.user?.name}</Link> */}
                    <Form className="inline" method="post">
                        <button className="text-right p-4" type="submit">Logout</button>
                    </Form>
                </>
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