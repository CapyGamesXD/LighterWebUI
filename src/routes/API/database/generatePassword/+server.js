//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from '$lib/database.js'

export async function POST({request}) {
const random = crypto.randomUUID()
const newPass = random.slice(0, 8);
await db.ref('/site/password').set(newPass)

return json(newPass)
}



