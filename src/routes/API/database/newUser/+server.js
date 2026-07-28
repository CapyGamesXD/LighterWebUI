//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from "$lib/database";

export async function POST({request}) {
const { newUserName } = await request.json();
const newUserId = crypto.randomUUID();

try {
await db.ref(`/lighterwebui/users/${newUserId}`).set({userName: newUserName, userId: newUserId});

const snapshot = await db.ref(`/lighterwebui/users`).get();
let val = snapshot.val();
let storedUsers = val ? Object.values(val) : [];

let list = [...storedUsers, {userName: "Guest", userId: null}]

return json({list})
} catch (e) {
    return json({error: e})
}
}