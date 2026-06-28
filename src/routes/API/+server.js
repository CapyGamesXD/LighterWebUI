//@ts-nocheck
import { json } from "@sveltejs/kit";
import ollama from 'ollama'

export async function POST({ request, cookies }) {
	const { messages } = await request.json();



const response = await ollama.chat({
  model: 'qwen2.5:3b',
  messages: [{role: 'user', content: messages}],
})
console.log(response.message.content)


    const reply = response.message.content;
	return json({ reply }, { status: 201 });
}