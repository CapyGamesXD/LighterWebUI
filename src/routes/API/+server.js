//@ts-nocheck
import { json } from "@sveltejs/kit";
import { createOllama } from 'ollama-ai-provider-v2';
import { z } from 'zod';
import {tool, streamText, convertToModelMessages, stepCountIs } from 'ai';
import { tavily } from "@tavily/core";
import { db } from "$lib/database.js";



export async function POST({ request }) {
  const{ selectedModel, systemPrompt, tavilyAPIKey, messages, currentChatId, userId} = await request.json();
  let apiRouteSnapshot = await db.ref(`site/APIRoute`).get();
  let apiKeySnapshot = await db.ref(`site/APIKey`).get();
  let apiRoute = apiRouteSnapshot.val();
  let apiKey = apiKeySnapshot.val();
  let baseURL = apiRoute ? String(apiRoute) : 'https://ollama.com/api'
  let searchCount = 0;
  async function searchWeb(query) {
    if(!tavilyAPIKey) {
      return {error: "No Tavily API key. Prompt the user to enter one in the site's settings"}
    }
   searchCount++;
    try {
      const tvly = tavily({ apiKey: tavilyAPIKey });
      const response = await tvly.search(query, {maxResults: 4});

      
      return {results: response, searchCount: `Current search: ${searchCount}.`};
    } catch (e) {
      console.error(e)
      return {error: `Search failed ${e}`}
    }
  
  }

const ollama = createOllama(
  {
    baseURL: baseURL,
    headers: apiKey ? { Authorization: `Bearer ${apiKey}`} : {}
  }
)

try {
      const response = await streamText({
  model: ollama(selectedModel || 'gemma4:31b-cloud'),
  messages: await convertToModelMessages(messages),
  stopWhen: stepCountIs(12),
  system: systemPrompt,
  tools: {
    testTools: tool({
      description: 'Test if tool calling is working',
      inputSchema: z.object({}),
      execute: async () => ({
        response: 'Tool calling is working!'
      }),
    }),
    searchWeb: tool({
      description: 'Get information from the web. Use this for fetching up-to-date or specific information for the user.',
      inputSchema: z.object({
        query: z.string().describe('The query to search'),
      }),
      execute: async ({ query }) => searchWeb(query)
      
    }),
    endChat: tool({
      description: "End the chat if the user violates the rules. Before calling this function, provide the reason and tell the user that you're ending the chat.",
      inputSchema: z.object({
        reason: z.string().describe('The reason for ending the chat, e.g: inappropriate content')
      }),
      execute: async ({ reason }) => {
        try {
       await db.ref(`${userId}/chats/${currentChatId}`).remove()
       return {response: 'Success'}
        } catch(e) {
          return {response: e.message}
        }
      }
    })
  },
})
return response.toUIMessageStreamResponse();
} catch (e) {
        console.error(e)
        if(e.statusCode === 402 || e.statusCode === 403) {
          const fancyErrorMessage = 'This model requires a subscription. Please select another model (e.g, Gemma4:31b).'
          return json({error: fancyErrorMessage}, {status: 500}) 
        } else {
           return json({error: e.message}, {status: 500}) 
        }
        
      }

  }

  