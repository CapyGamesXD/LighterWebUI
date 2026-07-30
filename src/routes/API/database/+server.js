//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from '$lib/database.js'



export async function POST({request}) {
    const { currentChatId, userId, newMessages } = await request.json()
    
    try {
        for(const newMessage of newMessages) {
            await db.ref(`${userId}/chats/${currentChatId}/messages/`).push(newMessage)
        }
    } catch (e) {
        console.error("ERROR!", e)
    }
    

    return json({status: 200})
}



