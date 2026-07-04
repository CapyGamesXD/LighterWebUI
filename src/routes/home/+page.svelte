<script>
 //@ts-nocheck
import { json } from "@sveltejs/kit";
	import { onMount } from "svelte";

    let models = $state([]);
let selectedModel = $state();
onMount(() => {
    fetchModels();
})
   
async function fetchModels() {
    const response = await fetch('/API/fetchModels', {method: 'POST'})

    models = await response.json();
  
    console.log(models)

}
    let input = $state('');
    let reply = $state('');
    let messages = $state([{role: 'system', content: 'You are a friendly helper/assistant AI. Do not talk about politics, war, or anything controversial. Do not discuss opinionated topics, and stay impartial'}])
    
    async function sendPrompt(prompt) {    
        if(prompt && selectedModel) {
           
            messages = [...messages, {role: 'user', content: prompt}];
        input = ''
        reply = ''
        
             const response = await fetch('/API', {
			method: 'POST',
			body: JSON.stringify({ messages, selectedModel }),
			headers: {
				'Content-Type': 'application/json'
			}
        
            
		});

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while(true) {
            const {value, done } = await reader.read();
            if(done) {
                break;
            }
            reply += decoder.decode(value)
        }
        messages = [...messages, {role: 'assistant', content: reply}]
        console.log(messages)
        } else {
            console.log('Prompt is empty!')
        }

    }

</script>
<p>Welcome!</p>
<select  bind:value={selectedModel} >
   {#each models as model}
<option value={model.model}>{model.name}</option>
{/each} 
</select>
<p>Selected model: {selectedModel}</p>

<input bind:value={input}>
<button onclick={() => sendPrompt(input.trim())}>Send</button>
<p>{reply}</p>
