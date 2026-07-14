//@ts-nocheck

import { db } from "$lib/database";

export async function POST({request}) {
const { newUserList } = await request.json();
db.ref(`/lighterwebui/userCount`).set(newUserList)
//Probably not a great way to handle it, but the idea is simple. :)
// It would be structured like this: [{userName: 'Penelope', userId: '138794'}, etc.]
}