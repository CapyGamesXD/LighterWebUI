//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from "$lib/database";

export async function POST({request}) {
const snapshot = await db.ref(`/lighterwebui/userCount`).get();
let list = snapshot.val() || [];
if(list[0] == null || list[0] == undefined) {
    list = [{userName: 'User 1', userId: '1'}]
}

return json({userListArray: list})

}