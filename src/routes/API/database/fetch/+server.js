import { json } from '@sveltejs/kit';
import { db } from '$lib/database.js'

export async function POST({request}) {
const { currentChatId, userId } = await request.json()
    
    const snapshot = await db.ref(`${userId}/chats/${currentChatId}/messages/`).get();
    const val = snapshot.val() || {};
    const messagesArray = Object.values(val);
    console.log('Messages Array:', messagesArray);
    return json(messagesArray);
}
