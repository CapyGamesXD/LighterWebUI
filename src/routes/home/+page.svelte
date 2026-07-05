<script>
 //@ts-nocheck
import { json } from "@sveltejs/kit";
import { onMount } from "svelte";
let models = $state();
let selectedModel = $state();
let replying = $state(false);
let chatArray = $state([]);
onMount(() => {
    fetchModels();
    getMessages();
})

async function newChat() {
    const response = await fetch('/API/database/newChat', {method: 'POST', body: JSON.stringify({userId, chatId, chatName})})
    chatArray = response.json();
    console.log(chatArray)
}

async function loadChats() {
    const response = await fetch('/API/database/fetchChats', {method: 'POST', body: JSON.stringify(userId)})
    chatArray = response.json();
    console.log(chatArray)
}
   
async function fetchModels() {
    const response = await fetch('/API/fetchModels', {method: 'POST'})

    models = await response.json();
    selectedModel = models[0].model;
    console.log(models)


}
let input = $state('');
let reply = $state('');
let messages = $state([])
let controller;
let systemPrompt = $state('You are an AI assistant. Be friendly and helpful')
let sideMenu = $state();
let menuShown = $state(false)
const userId = '34359';
const chatId = 'chat-1'
let chatName = $state('My Super Awesome Chat!');

async function getMessages() {
    const response = await fetch('/API/database/fetch', {
        body: JSON.stringify({chatId, userId}), 
        method: 'POST', 
        headers: {  
            'Content-Type': 'application/json'
        }
    
    });
    const reply = await response.json();
    messages = [{role: 'system', content: systemPrompt}, ...reply];


}

async function storeMessages(role, text) {

    try {
         const response = await fetch('/API/database', {
        body: JSON.stringify({chatId, userId, role, text}), 
        method: 'POST', 
         headers: {  
            'Content-Type': 'application/json'
        }
    });
    console.log('Store successful.')
    } catch {
        console.log('Store Messages (storeMessages) function failed!')
    }
   
    
}

async function abort() {
    controller.abort();
    replying = false;
    messages = [...messages, {role: 'assistant', content: reply + '... Message cancelled.'}]
    await storeMessages('assistant', reply + '... Message cancelled.');
    reply = ''
}
async function sendPrompt(prompt) {    
    controller = new AbortController();
    if(prompt && selectedModel) {
    replying = true;
    messages = [...messages, {role: 'user', content: prompt}];
    storeMessages('user', prompt);
    input = ''
    reply = ''

    const response = await fetch('/API', {
    method: 'POST',
    body: JSON.stringify({ messages, selectedModel}),
    headers: {
       'Content-Type': 'application/json'
    },
    signal: controller.signal            
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
        await storeMessages('assistant', reply);
        messages = [...messages, {role: 'assistant', content: reply}]
       
        reply = '';
        replying = false;
        console.log(messages)

     
        } else {
            alert('Please check the selected model and prompt.')
        }
    }

</script>
<div class="centerdiv">
<div class="leftMenu" class:hiddenMenu={!menuShown} bind:this={sideMenu}>

</div>
<div class="topBar">

  <p class="koulen text-xl">
        <a href="/lighterDoc" class="koulen">Lighter</a>
        <a href="/webDoc" class="koulen">Web</a> 
        <a href="/uiDoc" class="koulen">UI</a>
    </p>
    <button onclick={() => {
        menuShown = !menuShown;

}}>=</button>

<select bind:value={selectedModel}>
    {#each models as model}
    <option value={model.model}>{model.name}</option>
    {/each}
</select>

</div>

<button onclick={newChat}>Create New Chat</button>
<input bind:value={chatName}> 

{#if messages[1]}
<div class="messagesDiv mt-4">

    {#each messages as message}
{#if message.role == 'user'}
<div class="userSide">
<h2>You:</h2>
<p>{message.content.trim()}</p>
</div>
{:else if message.role == 'assistant'}
<h2>Assistant:</h2>
<p>{message.content}</p>
{/if}
{/each}
{#if reply}
<h2>Assistant:</h2>
<p>{reply}</p>
{/if}
</div>
{/if}
{#if !messages[1]}
<h1>Welcome back</h1>
{/if}




<div class="bottom">
    <textarea bind:value={input}  placeholder="Why is the sky blue?"></textarea>
    {#if replying === false}
<button onclick={() => sendPrompt(input.trim())}>+</button>
{:else}
<button onclick={abort}>Abort</button>
{/if}

</div>


</div>

<style>
.userSide {
    text-align: right;
  
}

.leftMenu {
    height: 95vh;
    width: clamp(20rem, 20vw, 80vw);
    background-color: rgb(58, 58, 58);
    position: fixed;
    left: 20px;
    z-index: 2;
    border-radius: 20px;
    opacity: 1;
    box-shadow:  0px 0px 20px 0px rgba(0, 0, 0, 0.405);
    transition: 0.15s ease-in-out;
    transform-origin: left;
}

.leftMenu.hiddenMenu {
opacity: 0;

transform: scaleX(0);
}



h2 {
    font-size: 20px;
    font-weight: 500;
    line-height: 2;
}

.messagesDiv {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 50vw;
    gap: 15px;
    height: 75vh;
    padding-bottom: 80px;
    overflow-y: auto;
    padding: clamp(4rem, 20vw, 30rem);
    padding-top: 20px;
    padding-bottom: 20px;
    word-break:keep-all;

}
* {
    outline: none;
}
 .koulen {
     font-family: "koulen", sans-serif;
 }

 a {
    transition: 0.2s;
      max-height: 4vh;
 }
 a:hover {
    background-color: rgb(58, 86, 144);
    padding: 5px;
    font-size: 23px;
    border-radius: 2px;
 }

 h1 {
    font-size: 50px;
     font-family: "oswald", sans-serif;
     font-weight: 400;
     letter-spacing: 1.5px;
 }

 textarea {
   background-color: #191919;
   resize: none;
   field-sizing: content;
   width: clamp(20rem, 50vw, 70rem);
   max-height: 400px;
   border-radius: 10px;
   overflow-x: hidden;
   padding: 10px;
 }

 .bottom {
    position: fixed;
    bottom: 20px;
     display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: start;
    gap: 10px;
 }
</style>