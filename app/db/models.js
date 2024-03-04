import { mongoose } from "mongoose";
<<<<<<< HEAD
import bcrypt from "bcryptjs";
=======
>>>>>>> 2d848f7 (Initial commit)

const { Schema } = mongoose;

const entrySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
<<<<<<< HEAD
    useriD: {
      type: Schema.Types.ObjectId,
      ref: "Account",
    },
    image: String,
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    comment: [
      {
        useriD: {
          type: Schema.Types.ObjectId,
          ref: "Account",
        },
        comment: String,
        user: {
          name: String,
          mail: String,
          _id: {
            type: Schema.Types.ObjectId,
            ref: "Account",
          }
        },
        date: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    participant: [
      {
        name: String,
        _id: {
          type: Schema.Types.ObjectId,
          ref: "Account",
        },
        user: {
          name: String,
          mail: String,
          _id: {
            type: Schema.Types.ObjectId,
            ref: "Account",
          }
        },
      }
    ],
    public: {
      type: Boolean,
      required: true,
      default: false,
    },
=======
    type: {
      type: String,
      enum: ["work", "learning", "interesting-thing"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
>>>>>>> 2d848f7 (Initial commit)
  },
  // Automatically add `createdAt` and `updatedAt` timestamps:
  // https://mongoosejs.com/docs/timestamps.html
  { timestamps: true },
);

<<<<<<< HEAD
const messengerSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  messages: [{
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  unread: { type: Boolean, default: true }
});

const userSchema = new Schema(
  {
    image: String,
    mail: {
      type: String,
      required: true, // Ensure user emails are required
      unique: true // Ensure user emails are unique
    },
    name: String,
    title: String,
    password: {
      type: String,
      required: true, // Ensure user passwords are required
      select: false // Automatically exclude from query results
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this; // this refers to the user document

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) {
    return next(); // continue
  }

  const salt = await bcrypt.genSalt(10); // generate a salt
  user.password = await bcrypt.hash(user.password, salt); // hash the password
  next(); // continue
});

=======
>>>>>>> 2d848f7 (Initial commit)
// For each model you want to create, please define the model's name, the
// associated schema (defined above), and the name of the associated collection
// in the database (which will be created automatically).
export const models = [
  {
    name: "Entry",
    schema: entrySchema,
    collection: "entries",
  },
<<<<<<< HEAD
  {
    name: "Account",
    schema: userSchema,
    collection: "accounts",
  },
  {
    name: "Messenger",
    schema: messengerSchema,
    collection: "messages",
  },
=======
>>>>>>> 2d848f7 (Initial commit)
];