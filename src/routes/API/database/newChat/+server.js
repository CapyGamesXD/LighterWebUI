//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from '../database.js'



export async function POST({request}) {
    const { chatId, chatName, userId } = await request.json()
    
    await db.ref(`${userId}/chats/`).push({title: chatName, chatId: chatId})

    console.log('The chat was created.')
    return json({status: 200})
}



