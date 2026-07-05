//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from '$lib/database.js'



export async function POST({request}) {
    const { currentChatId, role, text, userId } = await request.json()
    
    await db.ref(`${userId}/chats/${currentChatId}/messages/`).push({role: role, content: text })

    return json({status: 200})
}



