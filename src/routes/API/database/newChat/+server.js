//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from '$lib/database.js'



export async function POST({request}) {
    const { chatName, userId } = await request.json()
    const randomChatID = crypto.randomUUID(); 
    await db.ref(`${userId}/chats/${randomChatID}`).set({title: chatName, chatId: randomChatID})

    console.log('The chat was created.')
    return json({chatId: randomChatID})
}



