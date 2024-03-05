import {authenticator} from "../services/auth.server";
import {useLoaderData} from "@remix-run/react";
import {json} from "@remix-run/node";
import mongoose from 'mongoose';

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
    return (
        <div className="w-1/2 m-auto p-2">
            {
                profile.image ?
                    <img src={profile.image} alt={profile.name} /> :
                    <img src="https://scontent-uc-d2c-7.intastellar.com/a/s/ul/p/avtr46-img/profile_standard.jpg" alt={profile.name} />
            }
            <h1 className="text-3xl">{profile.name}</h1>
            
        </div>
    );
}