//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from '$lib/database.js'



export async function POST({request}) {

    const { chat, userId } = await request.json()
    try {
    await db.ref(`${userId}/chats/${chat}`).remove()
    console.log('The chat was removed.')
    return json({status: 200})
    } catch (e) {
        console.log(e)
        return json({error: e})
    }
}



