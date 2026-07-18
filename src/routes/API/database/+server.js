//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from '$lib/database.js'



export async function POST({request}) {
    const { currentChatId, userId, messages } = await request.json()
    
    try {
    await db.ref(`${userId}/chats/${currentChatId}/messages/`).set(messages)
    } catch (e) {
        console.error("ERROR!", e)
    }
    

    return json({status: 200})
}



