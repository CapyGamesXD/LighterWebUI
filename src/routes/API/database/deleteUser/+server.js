//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from '$lib/database.js'



export async function POST({request}) {
    const { profile } = await request.json()
    const userId = profile.userId;
    try {  
    await db.ref(`/lighterwebui/users/${profile.userId}`).remove();
    await db.ref(`/${profile.userId}/chats`).remove();
    return json({status: 200})
    } catch(e) {
        console.log(e);
        return json({error: e});
    }
}



