import {authenticator} from "../services/auth.server";
import {Form, useLoaderData, useFetcher} from "@remix-run/react";
import {json} from "@remix-run/node";
import mongoose from 'mongoose';
import {useState} from "react";
import {uploadImage} from "../services/uploadImage.server";

export const loader = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request);
    if(params.profile_id == undefined){
        return new Response(null, {
            status: 404,
            text: "Not Found",
        
        });
    }

    const userId = new mongoose.Types.ObjectId(params.profile_id);
    const profile = await mongoose.models.Account.findOne({_id: userId});

    if(!profile){
        return new Response(null, {
            status: 404,
            text: "Not Found",
        });
    }

    return json({profile, user});
}
export default function Profile(){
    const {profile, user} = useLoaderData();
    const fetcher = useFetcher();
    const [image, setImage] = useState(profile?.image ? profile?.image : "https://scontent-uc-d2c-7.intastellar.com/a/s/ul/p/avtr46-img/profile_standard.jpg")
    const [showEdit, setShowEdit] = useState(false);

    function handleImageChange(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    return (
        <div className="bg-slate-900 text-slate-50">
            <div className="grid grid-cols-2 w-1/2 m-auto p-2">
                <section>
                    <img className="w-1/4 h-auto aspect-square object-cover mb-3 rounded-xl" src={image} alt={profile.name} /> 
                    <h1 className="text-3xl">{profile.name}</h1>
                </section>
                <section>
                    <button className="bg-slate-300 rounded-md text-slate-600 px-7 py-3 mt-3 mb-6" onClick={() => {
                        setShowEdit(!showEdit);
                    }}>Edit profile image</button>
                    {
                        (showEdit && user?._id === profile._id) ? (
                            <fetcher.Form method="post" encType="multipart/form-data">
                                <fieldset disabled={fetcher.submitting} className="disabled:opacity-20">
                                    <input
                                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                        name="image"
                                        type="file"
                                        onChange={handleImageChange}
                                    />
                                    <button className="bg-slate-600 p-3 px-11 mt-3" type="submit">Update Image</button>
                                </fieldset>
                            </fetcher.Form>
                        ) : null
                    }
                </section>
            </div>
        </div>
    );
}

export const action = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request);
    const userId = new mongoose.Types.ObjectId(params.profile_id);
    const formData = await request.formData();
    const { image } = Object.fromEntries(formData);

    if (image && image._name) {
        const newImage = await uploadImage(image);
        if(!image){
            return new Response(null, {
                status: 400,
                text: "Image is required",
            });
        }

        await mongoose.models.Account.findOneAndUpdate({_id: userId}, {
            image: newImage,
        });
    }else{
        throw new Error("Image file is missing or invalid");
    }

    return new Response(null, {
        status: 302,
        headers: {
            Location: `/profile/${params.profile_id}`,
        },
    });
}