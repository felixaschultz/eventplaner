import {authenticator} from "../services/auth.server";
import {Form, useLoaderData} from "@remix-run/react";
import {json} from "@remix-run/node";
import mongoose from 'mongoose';
import {useState} from "react";

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

    return json({profile});
}
export default function Profile(){
    const {profile} = useLoaderData();
    const [image, setImage] = useState(profile?.image ? profile?.image : "https://scontent-uc-d2c-7.intastellar.com/a/s/ul/p/avtr46-img/profile_standard.jpg")
    
    function handleImageChange(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    return (
        <div className="w-1/2 m-auto p-2">
            <img className="w-1/2 h-1/2" src={image} alt={profile.name} /> 
            <h1 className="text-3xl">{profile.name}</h1>
            {/* <Form method="post">
                <input
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    name="image"
                    type="file"
                    onChange={handleImageChange}
                />
                <button className="bg-slate-600 p-3 px-11 mt-3" type="submit">Update Image</button>
            </Form> */}
        </div>
    );
}

export const action = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request);
    const userId = new mongoose.Types.ObjectId(params.profile_id);
    const formData = await request.formData();
    const { image } = Object.fromEntries(formData);

    if (image && image.filename) {
        const image = await uploadImage(image);
        if(!image){
            return new Response(null, {
                status: 400,
                text: "Image is required",
            });
        }

        await mongoose.models.Account.findOneAndUpdate({_id: userId}, {
            image: image,
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

export async function uploadImage(imageFile) {
    const imageData = await imageFile.arrayBuffer(); // Convert the image file to ArrayBuffer
    const buffer = Buffer.from(imageData); // Convert ArrayBuffer to Node.js Buffer
  
    const url = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_PROJECT_ID}.appspot.com/o/${imageFile.name}`; // URL to upload image to Firebase Storage
  
    // POST request to upload image
    const response = await fetch(url, {
      method: "POST",
      body: buffer,
      headers: { "Content-Type": imageFile.type },
    });
    const data = await response.json();
  
    if (!data) {
      throw new Error("Image upload failed");
    }
  
    const imageUrl = `${url}?alt=media`;
  
    return imageUrl;
  }