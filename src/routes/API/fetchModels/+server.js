//@ts-nocheck
import { json } from '@sveltejs/kit'

export async function POST({ request } ) {
    const response = await fetch('http://localhost:11434/api/tags');
    const reply = await response.json();
    const models = reply.models;
   
    return json(models);
}