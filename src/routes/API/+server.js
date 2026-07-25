//@ts-nocheck
import { json } from "@sveltejs/kit";
import { createOllama } from 'ollama-ai-provider-v2';
import { z } from 'zod';
import {tool, streamText, convertToModelMessages, stepCountIs } from 'ai';
import { tavily } from "@tavily/core";
import { db } from "$lib/database.js";



export async function POST({ request }) {
  const{ selectedModel, systemPrompt, tavilyAPIKey, messages} = await request.json();


  let apiRouteSnapshot = await db.ref(`site/APIRoute`).get();
  let apiKeySnapshot = await db.ref(`site/APIKey`).get();

  let apiRoute = apiRouteSnapshot.val();
  let apiKey = apiKeySnapshot.val();

  let baseURL = apiRoute ? String(apiRoute) : 'http://localhost:11434/api'

  async function searchWeb(query) {
    if(!tavilyAPIKey) {
      return {error: "No Tavily API key."}
    }
    try {
      const tvly = tavily({ apiKey: tavilyAPIKey });
      const response = await tvly.search(query, {maxResults: 2});
      console.log("Search response: ", response)
      return response
    } catch (e) {
      console.error(e)
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
    searchWeb: tool({
      description: 'Get information from the web. Use this for fetching up-to-date or specific information for the user.',
      inputSchema: z.object({
        query: z.string().describe('The query to search'),
      }),
      execute: async ({ query }) => {
      try {
       const response = await searchWeb(query);
        return {response}
      } catch (e) {
        console.error(e)
        return {response: `Search error: ${e.message}`}
      }
      },
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

  