//@ts-nocheck
import { json } from "@sveltejs/kit";
import { db } from '$lib/database.js'




export async function POST({request}) {
    const { enteredAPIKey, apiRoute, passwordEntered } = await request.json()
    const correctPassword = await (await db.ref('site/password').get()).val();

if(passwordEntered === correctPassword) {
   try {
    if(enteredAPIKey) {
          await db.ref(`site/APIKey`).set(enteredAPIKey)
          console.log("Saved API key!")
    }
    if(apiRoute) {
        await db.ref(`site/APIRoute`).set(apiRoute)
        console.log("Saved API route!")
    }
    console.log('Success!')
    return json({success: true})
    } catch (e) {
        console.error("Error occured in newRoute creation, error:", e)
        return json({success: false})
    }
} else {
    return json(false)
} 
}



