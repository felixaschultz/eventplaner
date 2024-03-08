import { Form } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import mongoose from "mongoose";
import { useFetcher } from "react-router-dom";
import { useActionData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useState } from "react";
import { uploadImage } from "~/services/uploadImage.server";

export const loader = async ({ request }) => {
    await authenticator.isAuthenticated(request, {
        failureRedirect: "/login"
    });
    return "";
};

export default function Create(){
    const fetcher = useFetcher();
    const actionData = useActionData();
    const [image, setImage] = useState(null);

    return (
        <div className="p-8 text-slate-50 bg-slate-900 min-h-full">
            <fetcher.Form className="w-1/2 m-auto" method="post" encType="multipart/form-data">
                <h1 className="text-3xl font-bold">Create Event</h1>
                <fieldset disabled={(fetcher.state === "submitting") ? true : false}>
                    {
                        (image != null) ? (
                            <section>
                                <img src={URL.createObjectURL(image)} alt="event" />
                                <input className="hidden" required type="file" id="image" name="image" onChange={(e) => setImage(e.target.files[0])} />
                            </section>
                        ) : (
                            <section>
                                <div onClick={handleUpload} className="w-full border-dotted border-red-50 border-2 h-48">
                                    <p className="flex justify-center items-center h-full cursor-pointer">Upload Image</p>
                                </div>
                                <input
                                    id="image"
                                    className="hidden w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                    name="image"
                                    type="file"
                                    onChange={handleImageChange}
                                />
                            </section>
                        )
                    }
                    <article className="grid grid-cols-2 gap-4">
                        <section>
                            <label htmlFor="title">Title</label>
                            <input required className="block w-full p-2 text-slate-500" type="text" id="title" name="title" />
                        </section>
                        <section>
                            <label htmlFor="description">Description</label>
                            <textarea placeholder="Write your awesome Invitation" required className="block w-full p-2 text-slate-500" id="description" name="description" />
                        </section>
                        <section>
                            <label htmlFor="place">Place</label>
                            <input required className="block w-full p-2 text-slate-500" type="text" id="place" name="place" />
                        </section>
                        <section>
                            <label htmlFor="date">Date</label>
                            <input required className="block w-full p-2 text-slate-500" type="datetime-local" id="date" name="date" />
                        </section>
                    </article>
                </fieldset>
                <div className="error-message">{actionData?.error ? <p>{actionData?.error?.message}</p> : null}</div>
                <button  className="bg-slate-600 p-3 px-11 mt-3" type="submit">Create Event</button>
            </fetcher.Form>
        </div>
    );

    function handleUpload(){
        document.getElementById("image").click();
    }

    function handleImageChange(e){
        setImage(e.target.files[0]);
    }
}

export const action = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });

    
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const image = data.image;
    let newImage = null;
    if (image && image._name) {
        newImage = await uploadImage(image);
        if(!image){
            return new Response(null, {
                status: 400,
                text: "Image is required",
            });
        }
    }


    if(!data.title || !data.description || !data.place || !data.date){
        return json({ error: "All fields are required" }, {
            status: 400,
        });
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    data.useriD = userId;
    data.image = newImage;

    const NewEvent = await mongoose.models.Entry.create(data);

    if(NewEvent){
        return new Response(null, {
            status: 302,
            headers: {
                location: "/my-events",
            },
        });
    }else{
        return new Response(null, {
            status: 500,
            body: "Error creating event",
        });
    }
};