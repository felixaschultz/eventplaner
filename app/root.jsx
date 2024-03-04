import {
  Links,
  Link,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from "@remix-run/react";
import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import Header from "./components/Header";
import styles from "./tailwind.css";
import { authenticator } from "./services/auth.server";

export const links = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export function meta() {
  return [{ title: "Event Planer" }];
}

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request);

  return { user };
}

export default function App() {
  const user = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header user={user} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export async function action({request}){
  await authenticator.logout(request, {
    redirectTo: "/login",
  });
}

export function ErrorBoundary() {
  let error = useRouteError();
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-col items-center justify-center">
        <p className="text-3xl">Whoops!</p>
        {isRouteErrorResponse(error) ? (
          <p>
            {error.status} – {error.statusText}
          </p>
        ) : error instanceof Error ? (
          <p>{error.message}</p>
        ) : (
          <p>Something happened.</p>
        )}
        <Scripts />
      </body>
    </html>
  );
}