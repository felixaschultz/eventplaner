import { Form } from "@remix-run/react";
import "../Styles/login-signup.css";
export function loader() {
  return { message: "Hello from the loader!" };
}

export default function Login() {
  return (
    <div className="p-8 text-slate-50 bg-slate-900">
        <h1 className="text-3xl font-bold">Login</h1>
        <Form method="post">
            <div>
                <label htmlFor="email">Email</label>
                <input className="block p-2 text-slate-500" type="email" id="email" name="email" />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input className="block p-2 text-slate-500" type="password" id="password" name="password" />
            </div>
            <div>
                <button className="bg-slate-300 p-3 px-11 mt-3" type="submit">Signup</button>
            </div>
        </Form>
    </div>
  );
}

export function action({request}){
    const formData = request.formData();
    const data = Object.fromEntries(formData);

    console.log(data);
}