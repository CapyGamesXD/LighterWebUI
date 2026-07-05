//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from './database.js'



export async function POST({request}) {
    const { chatId, role, text, userId } = await request.json()
    
    await db.ref(`${userId}/${chatId}/messages/`).push({role: role, content: text })

    return json({status: 200})
}



