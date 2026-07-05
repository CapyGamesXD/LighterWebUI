<script>
 //@ts-nocheck
import { json } from "@sveltejs/kit";
import { onMount } from "svelte";
import { ArrowUp, PanelLeft, PanelRight } from 'lucide-svelte';
let models = $state();
let selectedModel = $state();
let replying = $state(false);
let chatArray = $state([]);
onMount(async () => {
    const searchParams = new URLSearchParams(window.location.search) 
    currentChatId = searchParams.get('chat') || '';
    await fetchModels();
    await getMessages();
    await loadChats();
})
async function deleteChat(chatIndex) {
    console.log("Deleting:", chatArray[chatIndex].name)
}

async function newChat(chatName) {
    if(chatName && userId) {
        
    const response = await fetch('/API/database/newChat', {method: 'POST', body: JSON.stringify({userId, chatName}), 
    headers: {  
            'Content-Type': 'application/json'
        }})
   const data = await response.json();
   const newChatId = data.chatId;
    window.location.replace(`/home?chat=${newChatId}`)
    } else {
        alert('Enter a valid chat name.')
    }
}

async function loadChats() {
    const response = await fetch('/API/database/fetchChats', {method: 'POST', body: JSON.stringify({userId}), headers: {  
            'Content-Type': 'application/json'
        }})
    chatArray = await response.json();
        chatArray = chatArray.reverse();
    
}
   
async function fetchModels() {
    const response = await fetch('/API/fetchModels', {method: 'POST', headers: {  
            'Content-Type': 'application/json'
        }})

    models = await response.json();
    selectedModel = models[0].model;
    console.log(models)


}
let input = $state('');
let reply = $state('');
let messages = $state([])
let controller;
let systemPrompt = $state('You are an AI assistant.')
let sideMenu = $state();
let menuShown = $state(false)
const userId = '34359';
let currentChatId = $state('')
let chatName = $state('');

async function getMessages() {
    if(currentChatId) {
        const response = await fetch('/API/database/fetch', {
        body: JSON.stringify({currentChatId, userId}), 
        method: 'POST', 
        headers: {  
            'Content-Type': 'application/json'
        }
    
    });
    const reply = await response.json();
    messages = [{role: 'system', content: systemPrompt}, ...reply];
    }
    

}

async function storeMessages(role, text) {
if(currentChatId) {
    try {
         const response = await fetch('/API/database', {
        body: JSON.stringify({currentChatId, userId, role, text}), 
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

<div class="closePanelFullExtent">
  <h2>Chats:</h2>
     <button onclick={() => {
        menuShown = !menuShown;

}}><PanelLeft></PanelLeft></button>
</div>

    
  

    <p>Name:</p>
<input bind:value={chatName} placeholder="e.g, Capybara Olympics Pitch"> 
<button onclick={() => {newChat(chatName)}} class="newChat">Create New Chat</button>

<div class="divider"></div>
{#if chatArray.length >= 1}
{#each chatArray as chat}
<button class="chatButton" onclick={() => {
window.location.replace(`/home?chat=${chat.chatId}`)
}}>
    <p>{chat.title}</p>
    
</button>

{/each}
{:else}
<p>No chats found, create one to get started!</p>
{/if}
</div>
<div class="topBar">

    {#if !menuShown}
     <button onclick={() => {
        menuShown = !menuShown;

}}><PanelLeft></PanelLeft></button>
{:else}
<placeholder></placeholder>
{/if}

  <p class="koulen text-xl">
        <a href="/lighterDoc" class="koulen">Lighter</a>
        <a href="/webDoc" class="koulen">Web</a> 
        <a href="/uiDoc" class="koulen">UI</a>
    </p>
   

<select bind:value={selectedModel}>
    {#each models as model}
    <option value={model.model}>{model.name}</option>
    {/each}
</select>

</div>




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
{#if currentChatId}
<h1>Welcome back</h1>
{:else}
<h1>Open a chat to get started!</h1>
<p>Click the button in the top left corner to open the chats menu.</p>
{/if}
{/if}

<div class="bottom">
    <textarea bind:value={input}  placeholder="Why is the sky blue?"></textarea>
    {#if replying === false}
<button onclick={() => sendPrompt(input.trim())}>
    <ArrowUp></ArrowUp>
</button>
{:else}
<button onclick={abort}>Abort</button>
{/if}

</div>


</div>

<style>
.closePanelFullExtent {
    width: 100%;
    display: flex;

    justify-content: space-between;
    flex-direction: row;

}
.topBar > p {
    position: absolute;
    text-align: center;
    left: 50%;
    transform: translateX(-50%);
}
.chatButton {
     width: 100%;
    background-color: #2c2c2c;
    text-align: center;
    border-radius: 10px;
    padding: 5px;
}
.divider {
    height: 3px;
    width: 100%;
    background-color: rgb(74, 74, 74);
    border-radius: 20px;
}

input {
    width: 100%;
    background-color: #191919;
    text-align: center;
    border-radius: 30px;
}
.newChat {
        width: 100%;
    background-color: #5a5a5a;
    text-align: center;
    border-radius: 30px;
}
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
    display: flex;
    flex-direction: column;
    gap: 10px;
 
padding: 10px 20px 10px 20px;

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