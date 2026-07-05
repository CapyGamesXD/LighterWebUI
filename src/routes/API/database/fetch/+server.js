import { json } from '@sveltejs/kit';
import { db } from '../database.js'

export async function POST({request}) {
const { chatId, userId } = await request.json()
    
    const snapshot = await db.ref(`${userId}/${chatId}/messages/`).get();
    const val = snapshot.val() || {};
    const messagesArray = Object.values(val);
    console.log('Messages Array:', messagesArray);
    return json(messagesArray);
}
