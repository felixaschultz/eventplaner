import { useLoaderData, useFetcher } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { mongoose } from "mongoose";
import { Form } from "@remix-run/react";
import { uploadImage } from "~/services/uploadImage.server";
import { useState } from "react";

export async function loader({request, params}){
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login"
    });

    const eventId = new mongoose.Types.ObjectId(params.event_id);

    const event = await mongoose.models.Entry.findOne({_id: eventId});

    if(event.useriD != user?._id){
        throw new Response(null, {
            status: 401,
            message: "Unauthorized",
        });

    }

    if(!event){
        throw new Response(null, {
            status: 404,
            text: "Not Found",
        });
    }

    return {event: event};
}

export const meta = ({data}) => {
    return [
        {
            title: `Edit Event: ${data.event.title} | Event Planer`
        }
    ];
};

export default function Event(){
    const {event} = useLoaderData();
    const [image, setImage] = useState(event?.image ? event?.image : null);
    const fetcher = useFetcher();

    
    const defaultDate = new Date(event.date).toISOString().slice(0, 16);
    /* const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const imageRegex = new RegExp(`.(${validImageExtensions.join('|')})$`, 'i'); */

    
    return (
        <div className="p-8 text-slate-50 bg-slate-900 min-h-full">
            <section className="w-1/2 m-auto">
                <h1 className="text-3xl font-bold">Edit Event: {event.title}</h1>
                <Form className="my-5" method="post" onSubmit={handleSubmit}>
                    <button className="bg-red-600 mx-2 rounded-md text-slate-200 px-6 py-1" name="_action" value="delete">Delete Event</button>
                    <button className="bg-slate-500 mx-2 rounded-md text-slate-200 px-6 py-1" name="_action" value="public">Make { event.public ? "Private": "Public" }</button>
                </Form>
                <fetcher.Form method="post" encType="multipart/form-data">
                    {(event?.image || image) ? <img onClick={openImageDialog} className="w-full h-72 mb-3 object-cover" src={image} alt="event" /> : 
                        <div onClick={openImageDialog} className="w-full border-dotted border-red-50 border-2 h-48">
                            <p className="flex justify-center items-center h-full cursor-pointer">Upload Image</p>
                        </div>
                    }
                    <fieldset className="grid grid-cols-2 gap-4" disabled={fetcher.state === "submitting" ? true : false}>
                        <section>
                            <label htmlFor="title">Title</label>
                            <input className="w-full block p-2 text-slate-500" type="text" id="title" name="title" defaultValue={event.title} />
                        </section>
                        <section>
                            <label htmlFor="description">Description</label>
                            <textarea className="w-full block p-2 text-slate-500 resize-none" id="description" name="description" defaultValue={event.description} />
                        </section>
                        <section>
                            <label htmlFor="place">Place</label>
                            <input className="w-full block p-2 text-slate-500" type="text" id="place" name="place" defaultValue={event.place} />
                        </section>
                        <section>
                            <label htmlFor="date">Date</label>
                            <input className="w-full block p-2 text-slate-500" type="datetime-local" id="date" name="date" defaultValue={defaultDate} />
                            {(event.image) ?
                                <section className="">
                                    <input id="image"
                                        className="hidden w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                        name="image"
                                        type="file"
                                        onChange={handleImageChange}
                                    />
                                    {
                                        (event.image === image) ?
                                            <input type="hidden" value={event.image == image ? image : null} name="oldImage" /> : null
                                    }
                                </section> :  
                            <>
                            <input
                                    id="image"
                                    className="hidden w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                    name="image"
                                    type="file"
                                    onChange={handleImageChange}
                                />
                            </>}
                        </section>
                        <button  className="bg-slate-600 p-3 px-11 mt-3 col-span-2" type="submit">Update Event</button>
                    </fieldset>
                </fetcher.Form>
            </section>
        </div>
    );

    function handleImageChange(e){
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    function openImageDialog(){
        document.querySelector("#image").click();
    }
}

export const action = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });

    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const { _action } = Object.fromEntries(formData);
    const eventId = new mongoose.Types.ObjectId(params.event_id);
    const userId = new mongoose.Types.ObjectId(user._id);
    data.useriD = userId;

    if(_action === "public"){
        const entry = await mongoose.models.Entry.findById(eventId);
        entry.public = !entry.public;
        await entry.save();
        return new Response(null, {
            status: 302,
            headers: {
                location: "/my-events",
            },
        });
    }else if(_action === "delete"){

        await mongoose.models.Entry.findByIdAndDelete(params.event_id);

        return new Response(null, {
            status: 302,
            headers: {
                location: "/my-events",
            },
        });
    }else{

        const { image, oldImage } = Object.fromEntries(formData);

        if(user._id !== data.useriD){
            return new Response(null, {
                status: 401,
                headers: {
                    location: "/login",
                },
            });
        }

        if(oldImage){
            data.image = oldImage;
        }

        if (image instanceof File && oldImage == undefined) {
            const newImage = await uploadImage(image);
            if(newImage){
                data.image = newImage;
            }
        }

        const updatedEvent = await mongoose.models.Entry.updateOne(
            {_id: eventId},
            data
        );
    
        if(updatedEvent){
            return new Response(null, {
                status: 302,
                headers: {
                    location: "/event/" + params.event_id,
                },
            });
        }
    }
};

function handleSubmit(e){
    const value = e.nativeEvent.submitter.value;
    if(value === "delete" && !confirm(`Are you sure, you want to delete this event?`)){
        e.preventDefault();
    }else if(value === "public" && !confirm(`Are you sure, you want to make this event ${e.nativeEvent.submitter.innerText.indexOf("Public") > -1 ? "public" : "private"}?`)){
        e.preventDefault();

    }
}