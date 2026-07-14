import { json } from '@sveltejs/kit';
import { db } from '$lib/database.js'

export async function POST({request}) {
const { userId } = await request.json()
    
    const snapshot = await db.ref(`${userId}/chats/`).get();

    const chatsArray = Object.values(snapshot.val() || {});
 
    return json(chatsArray);
}
