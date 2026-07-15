//@ts-nocheck
import { json } from "@sveltejs/kit";
import ollama from 'ollama'
import { encode } from "punycode";

function testTools() {
  return Math.random()

}

export async function POST({ request }) {
  
  const{ messages, selectedModel} = await request.json();


  let aiReply = '';
const stream = new ReadableStream({
  async start(c) {
    const encoder = new TextEncoder();
  
      const response = await ollama.chat({
  model: selectedModel,
  messages: messages,
  stream: true,

      })

for await(const chunk of response) {
  if(chunk.message.content) {
      aiReply += chunk.message.content;
     c.enqueue(encoder.encode(chunk.message.content))
      }
      

}

console.log(messages)
    c.close();
  }
}) 
 

return new Response(stream)

}
  