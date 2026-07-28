//@ts-nocheck
import { json } from '@sveltejs/kit'
import { db } from '$lib/database.js'
import { ur } from 'zod/locales';

export async function POST({ request } ) {
try {
    const snapshot = await db.ref('/site/APIRoute').get();
    const url = snapshot.val() ? snapshot.val() : 'https://ollama.com/api';
         const response = await fetch(`${url}/tags`);
    const reply = await response.json();
    const models = reply.models;
    return json(models);   
} catch (e) {
 console.error(e)   
}
    
}