import { json } from '@sveltejs/kit';
import { db } from '$lib/database.js'

export async function POST({request}) {
const { userId } = await request.json()
    
    const snapshot = await db.ref(`${userId}/chats/`).get();
    const val = snapshot.val() || {};
    const chatsArray = Object.values(val);
 
    return json(chatsArray);
}
