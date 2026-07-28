//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from '$lib/database.js'

export async function POST({request}) {
const snapshot = await db.ref('/site/password').get();
if(!snapshot.val()) {
    const random = crypto.randomUUID()
const newPass = random.slice(0, 8);
await db.ref('/site/password').set(newPass)
return json(newPass)
}

return json(false)

}


