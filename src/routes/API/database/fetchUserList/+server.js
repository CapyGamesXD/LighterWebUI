//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from "$lib/database";

export async function POST({request}) {
const snapshot = await db.ref(`/lighterwebui/users`).get();

let val = await snapshot.val() || [];
let storedUsers = val ? Object.values(val) : [];

let list = [...storedUsers, {userName: "Guest", userId: null}]


return json({list})

}