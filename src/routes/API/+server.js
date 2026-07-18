//@ts-nocheck
import { json } from "@sveltejs/kit";
import { ollama } from 'ollama-ai-provider-v2';
import { z } from 'zod';
import {tool, streamText, convertToModelMessages, stepCountIs } from 'ai';

function testTools() {
  return Math.random()

}

export async function POST({ request }) {
  
  const{ messages, selectedModel, systemPrompt} = await request.json();


  let aiReply = '';
      const response = streamText({
  model: ollama(selectedModel),
  messages: await convertToModelMessages(messages),
  stopWhen: stepCountIs(5),
  system: systemPrompt,
  tools: {
    testTools: tool({
      description: 'Test if tool calling is working',
      inputSchema: z.object({}),
      execute: async () => ({
        response: 'Tool calling is working!'
      }),
    }),
  },


})

return response.toUIMessageStreamResponse();

  }

  