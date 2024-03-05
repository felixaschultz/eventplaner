// app/services/auth.server.ts
import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator(sessionStorage, {
  sessionErrorKey: "sessionErrorKey" // keep in sync
});

// ...
async function verifyUser({ mail, password }) {
  // ...
  const user = await mongoose.models.Account.findOne({ mail }).select("+password");
  if (!user) {
    throw new AuthorizationError("No user found with this email");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid || password == null || password === "" || password === undefined) {
    throw new AuthorizationError("Invalid password");
  }
  user.password = undefined;
  return user;
}

// Tell the Authenticator to use the form strategy
authenticator.use(
    new FormStrategy(async ({ form }) => {
      let mail = form.get("mail");
      let password = form.get("password");
      let user = null;
  
      if (!mail || mail?.length === 0) {
        throw new AuthorizationError("Bad Credentials: Email is required");
      }
      if (typeof mail !== "string") {
        throw new AuthorizationError("Bad Credentials: Email must be a string");
      }
  
      if (!password || password?.length === 0) {
        throw new AuthorizationError("Bad Credentials: Password is required");
      }
      if (typeof password !== "string") {
        throw new AuthorizationError("Bad Credentials: Password must be a string");
      }
      const verifedUser = await verifyUser({mail, password});
      if(verifedUser){
        return verifedUser;
      }
      return verifedUser;
    }),
    "user-pass"
);