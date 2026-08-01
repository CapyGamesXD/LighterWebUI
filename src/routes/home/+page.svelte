<script>
 //@ts-nocheck
import { json } from "@sveltejs/kit";
import { onMount, untrack, tick } from "svelte";
import { ArrowUp, PanelLeft, PanelRight, CircleX, Settings, GlobeOff, Wrench } from 'lucide-svelte';
import { user } from "$lib/userState.js";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { Chat } from '@ai-sdk/svelte'
import { DefaultChatTransport } from 'ai';
import { marked } from "marked";
import hljs from 'highlight.js';


let settingsPage = $state(1)
let newUserWindow = $state(false)
let loadingSite = $state(true)
let retryModel = $state('gpt-oss:120b')
let settingsMenu = $state(false)
let models = $state();
let selectedModel = $state();
let isLoading = $derived(chat.status === 'submitted' || chat.status === 'streaming');
let chatArray = $state([]);
let alertDialog = $state(false)
let itemToDelete = $state([])
let hiddenProfileMenu = $state(true);
let userList = $state([{}]);
let reply = $state('');
let dbInUse = $state(false)
let controller;
let systemPrompt = $state("")
let menuShown = $state(false)
let tavilyAPIKey = $state('');
let apiRoute = $state('https://localhost:11434/api');
let enteredAPIKey = $state('');
let passwordEntered = $state('');
let overrideModel = $state('');
let errorMessage = $state('')

let defaultSystemPrompt = "You are an AI assistant. The frontend is called LighterWebUI. Use tools when prompted to by the user, or when you feel they're suitable. After getting a search response, respond to the user's query. Do not repeat the same search query.  Do not swear or use any offensive terms. Do not liken the user to anything potentially offensive or rude. Do not engage or respond to potentially harmful content. You have an endChat function. This is reserved for the user violating policy. CRITICAL INSTRUCTIONS: When writing code snippets, scripts, or terminal commands, ALWAYS use proper Markdown syntax. Prioritise the user's safety and happiness. ALL code must be enclosed by three backticks followed by the language identifier. Example: ```python \n print('hello world') \n ```. NEVER output code without these backticks, as this will break the frontend. 2: Provide sources in the form of links for web search responses. 3: Use minimal searches per prompt. Avoid surpassing 5 search calls unless otherwise prompted.";
//This! This works by assigning the user profile details to this variable. That's what each button will do. :) Passing the parameter. This comment was made before I actually add that, so, heh, lil easter egg here :D
let currentChatId = $derived($page.url.searchParams.get('chat') || '')
marked.setOptions({
    highlight: (code) => hljs.highlightAuto(code).value
});
let chatName = $state('');
let input = $state('');
let userPrompt = $state('')
let newUserName = $state('');
async function newUser() {
    if(newUserName) {
    const response = await fetch('/API/database/newUser', {method: 'POST', body: JSON.stringify({newUserName}), 
    headers: {  
            'Content-Type': 'application/json'
        }})
    const data = await response.json();
    userList = [...data.list];

    newUserWindow = false;
    newUserName = '';
    userList = data.list;
    } else if (!newUserName) {
        alert('Enter a valid username.')
    }
}


  const chat = $state(new Chat({
    transport: new DefaultChatTransport({
    api: '/API',
    body: () => ({
         selectedModel,
         systemPrompt,
         tavilyAPIKey,
         userId: $user.userId,
         currentChatId,

    })
  }),
onFinish: async (message) => {
    if(!errorMessage) {
       await storeMessages(); 
    }
    
    if(chat.messages[chat.messages.length - 1].parts.find(p => p.type === 'tool-endChat')) {
        errorMessage = "Chat has been ended due to a rule violation."
        chatArray = chatArray.filter(c => c.chatId !== currentChatId);
        await loadChats();
        goto('/home');
        
    }
},

onError: async (error) => {
    errorMessage = error.message || "An unexpected error occurred";
    if(selectedModel !== retryModel && models.some(m => m.model === retryModel)) {
            errorMessage = 'An error occured with the selected model. Retrying with another model...'
            selectedModel = 'gpt-oss:120b'
            setTimeout(async () => {
                chat.messages.pop();
                input = userPrompt;
            await sendPrompt(input);
            errorMessage = '';
            userPrompt = '';
           
            }, 1500);
            
        } else {
            errorMessage = 'An unexpected error occured. Please select another model or try again later.'
        }
}}));
let autoScroll = $state(true)
function handleScrolling (e) {
const node = e.target;
const autoScrollSuitable = node.scrollHeight - node.scrollTop - node.clientHeight < 25;
autoScroll = autoScrollSuitable;
}
  async function sendPrompt(userInput) {
    if(!userInput) {
        alert("Please enter a valid prompt.")
        return;
    }


    userPrompt = userInput;
    input = '';
    errorMessage = '';
    scrollToBottom(element);
 
    try {
        await chat.sendMessage({ text: userPrompt });
        scrollToBottom(element);
    } catch (e) {
        input = userPrompt
    } 
  }

  let element = $state();
//Some lovely SvelteKit documentation code!
  onMount(() => scrollToBottom(element))

  const scrollToBottom = async (node) => {
    if(autoScroll) {
         await tick();
         if(node) {
            node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
         }
    
    }
   
  }; 
onMount(async () => {
    loadingSite = true;
    console.log("Current Chat ID:", currentChatId)

    tavilyAPIKey = localStorage.getItem('tavilyAPIKey') || '';
    selectedModel = localStorage.getItem("selectedModel") || '';
    apiRoute = localStorage.getItem('apiRoute') || '';
    
    overrideModel = localStorage.getItem('overrideModel');
    retryModel = localStorage.getItem('retryModel') || 'gpt-oss:120b';
    systemPrompt = localStorage.getItem('storedPrompt') || defaultSystemPrompt;

    try {
         //This is probably a bit excessive, but the userId controls where in the DB the data is stored. PlainNum helps with order :D I'll see whether I use it or not. 
    const storedUser = localStorage.getItem('previousUser') ? JSON.parse(localStorage.getItem('previousUser')) : {userName: 'Guest', userPlainNum: 0, userId: null};
    await loadUserLists();
    if(storedUser !== undefined && storedUser !== '' && storedUser !== null && userList.find(u => u.userId === storedUser.userId)) {
        user.set(storedUser)
    }
    console.log("User:", user)
} catch (e) {
    console.error(e)
}
 try {
    await fetchModels();
   

    } catch(error) {
        alert("Something went wrong during the startup process!")
    }
    
loadingSite = false;
})

function confirmUserDelete(userToDelete) {
    if (window.confirm(`Are you sure you want to delete ${userToDelete.userName}?`)) {
        deleteUser(userToDelete)
  } else {
    console.log("User deletion exited")
  }
}

function openAlert(chat) {
    if (window.confirm(`Are you sure you want to delete "${chat.title}"?`)) {
        deleteChat(chat)
  } else {
    console.log("Chat deletion exited")
  }
}

async function loadUserLists() {
    try {
    const response = await fetch('/API/database/fetchUserList', {method: 'POST'})
    const data = await response.json();
    console.log(data)
    userList = [...data.list];
    } catch(error) {
        console.error(error, 'In loadUserLists function')
    }
}
async function deleteChat(chatIndex) {
    console.log("Deleting:", chatIndex)
    if(chatIndex.chatId == currentChatId) {
        goto('/home');
        chat.messages = []
    }
   
    const response = await fetch('/API/database/deleteChat', {method: 'POST', body: JSON.stringify({userId: $user.userId, chat: chatIndex.chatId}), 
    headers: {  
            'Content-Type': 'application/json'
        }})

    await loadChats();

}

function saveBasicSettings () {

     localStorage.setItem("tavilyAPIKey", tavilyAPIKey)

    if(overrideModel) {
        selectedModel = overrideModel;
        localStorage.setItem("selectedModel", selectedModel);
    }

    localStorage.setItem('apiRoute', apiRoute);
    settingsMenu = false;
    localStorage.setItem('retryModel', retryModel);
    localStorage.setItem('storedPrompt', systemPrompt);

}

async function saveSettings () {
    
    if(apiRoute || enteredAPIKey) {
        try {
            const response = await fetch('/API/database/newRoute', {method: 'POST', body: JSON.stringify({apiRoute, enteredAPIKey, passwordEntered}), headers: {
                'Content-Type': 'application/json',
        }})


        if(await response.json() === false) {
            alert("Incorrect password, operation failed.")
            apiRoute = '';
            enteredAPIKey = '';
        } else {
            console.log("Save worked!")
        }
       
        } catch(e) {
            alert("Password incorrect/invalid. Please try again.")
            apiRoute = localStorage.getItem('apiRoute');
         }
    } 


     await fetchModels();
  
     settingsMenu = false;
     settingsPage = 1;
}

async function newChat(newChatName) {
    if(newChatName && $user.userId) {
    const response = await fetch('/API/database/newChat', {method: 'POST', body: JSON.stringify({userId: $user.userId, chatName: newChatName}), 
    headers: {  
            'Content-Type': 'application/json'
        }})
   const data = await response.json();
   const newChatId = data.chatId;
   menuShown = false;
   chatName = '';
    goto(`/home?chat=${newChatId}`)
    loadChats();
    } else if (!newChatName) {
        alert('Enter a valid chat name.')
    } else if (!$user.userId) {
        alert("Error code U1")
    } else {
        alert("Unknown error! Error U1")
    }
}

async function loadChats() {
    const response = await fetch('/API/database/fetchChats', {method: 'POST', body: JSON.stringify({userId: $user.userId}), headers: {  
            'Content-Type': 'application/json'
        }})
        let chatResponse = await response.json();
        chatResponse = chatResponse.reverse();
        if(chatResponse.length < 1) {
            goto('/home')
        }
         chatArray = chatResponse.filter(c => c.chatId !== undefined);
    
}
   
async function fetchModels() {
    const response = await fetch('/API/fetchModels', {method: 'POST', headers: {  
            'Content-Type': 'application/json'
        }})

        const fetchReply = await response.json();
        console.log("FetchModels response:", fetchReply);

        if(fetchReply.length >= 1) {
            models = await fetchReply;
            selectedModel = models[0].model;
            console.log(models)
        } else {
            selectedModel = ''
        }
    


}

async function getMessages() {
    const currentUserId = $user.userId;
    if(currentChatId && currentUserId !== null && !dbInUse) {
        try {
            dbInUse = true
        const response = await fetch('/API/database/fetch', {
        body: JSON.stringify({currentChatId, userId: currentUserId}), 
        method: 'POST', 
        headers: {  
            'Content-Type': 'application/json'
        }
    
    });
    const messagesReply = await response.json();
    chat.messages = Array.isArray(messagesReply) ? [...messagesReply] : [];
} catch (error) {
    alert("Message Load Failed! Error:", error)
} finally {
    dbInUse = false;
}
    } else {
chat.messages = [];
    }
    

}

async function storeMessages() {
if(chat.messages.length > 0 && $user.userId !== null && !dbInUse) {
         try {
        dbInUse = true
        const newMessages = chat.messages.slice(-2)
        const response = await fetch('/API/database', {
        body: JSON.stringify({currentChatId, userId: $user.userId, newMessages}), 
        method: 'POST', 
         headers: {  
            'Content-Type': 'application/json'
        }
    });
    console.log('Store successful.')
    } catch {
        console.log('Store Messages (storeMessages) function failed!')
    } finally {
        dbInUse = false
    }
    
} else {
    console.log("Guest User")
}

}

function openNewUserMenu () {
    closeAll();
    newUserWindow = true;
}

async function abort() {
   chat.stop();
}

function closeAll () {
    newUserWindow = false;
    hiddenProfileMenu = true;
    menuShown = false;
    settingsMenu = false;
    alertDialog = false;
}


async function deleteUser(profile) {
    if(profile.userId == $user.userId) {
        goto('/home');
        chat.messages = []
        $user = {userName: 'Guest', userPlainNum: 0, userId: null}
    }
   
    const response = await fetch('/API/database/deleteUser', {method: 'POST', body: JSON.stringify({profile}), 
    headers: {  
            'Content-Type': 'application/json'
        }})

    await loadUserLists();
}

$effect(() => {
    if($user) {
       
        console.log(`User has switched accounts. Current account: ${$user.userName}. Chats have been fetched.`)
        untrack(() => {
             loadChats();
        })
    }
})

$effect(() => {
    if($user && currentChatId) {
        
      return(() => {
        if(isLoading === true) {
            abort();
        }
      })
    }
})


$effect(() => {
if(currentChatId) {

untrack(async () => {
   await getMessages();
   errorMessage = '';
})
}
})





$effect(() => {
   const lastMessageForTrackingWowThatIsAReallyLongVariableNameButIGuessItMakesForANiceEasterEgg = chat.messages[chat.messages.length - 1];
   lastMessageForTrackingWowThatIsAReallyLongVariableNameButIGuessItMakesForANiceEasterEgg?.parts?.[lastMessageForTrackingWowThatIsAReallyLongVariableNameButIGuessItMakesForANiceEasterEgg.parts.length - 1]?.text;
    if(autoScroll) {
       (async () => {
        await tick();
        if(element) {
             element.scroll({top: element.scrollHeight, behavior: "smooth"})
        }
       
       })();
    }
})


</script>


<div class="centerdiv">
{#if !loadingSite}
<div class="newUserMenu" class:hiddenMenu={!newUserWindow}>
    <h2>New User</h2>
    <p>Username:</p>
    <input placeholder="E.g, Dad" bind:value={newUserName}>
    <button class="newUserButton" onclick={newUser}>Add</button>
    <button class="newUserButton" style="background-color: black;" onclick={() => {newUserWindow = false; newUserName = '';}}>Cancel</button>
</div>

    <div class="settingsMenu" class:hiddenMenu={!settingsMenu}>
    {#if settingsPage === 1}
        <h2>Settings:</h2>
        <p style="margin-top: 10px;">Tavily API Key (web search)</p>
        <input bind:value={tavilyAPIKey} type="password" placeholder="tvly-dev...">
        <p>Fallback model:</p>
        <input bind:value={retryModel} placeholder="E.g, gemma4:31b">
        <p>Custom model selection (override)</p>
        <input bind:value={overrideModel} placeholder="E.g, Llama3.2:3B">
        <p>System prompt:</p>
        <textarea class="smallTA" placeholder="You're a capybara eating grass in the amazon rainforest..." bind:value={systemPrompt}></textarea>
       
        <div class="buttonRow">
        <div class="fatDiv">
            <button class="advancedButton" onclick={() => {settingsPage = 2}}><p>Advanced</p></button>
        </div>
            
        <div class="right">
             <button class="saveButton" style="background-color: #d17960;" onclick={saveBasicSettings}>Save</button>
          <button class="saveButton" onclick={() => {
            settingsMenu = false
            overrideModel = localStorage.getItem('overrideModel') || '';
            retryModel = localStorage.getItem('retryModel') || 'gpt-oss:120b';
            systemPrompt = localStorage.getItem('storedPrompt') || defaultSystemPrompt;
            tavilyAPIKey = localStorage.getItem('tavilyAPIKey') || ''
            
          }}>Cancel</button>
        </div>
        </div>
        
       
{:else if settingsPage === 2}
        <h2>Advanced Settings</h2>
        <p>An administrator password is needed to change the following settings.</p>
        <p style="margin-top: 10px;">Password</p>
     <input bind:value={passwordEntered} type="password" placeholder="E.g, ABC123">

     
        <p>AI completion endpoint (Ollama cloud/local recommended)</p>
        <select bind:value={apiRoute}>
            <option value="http://localhost:11434/api">Default Ollama Local</option>
            <option value="https://ollama.com/api">Default Ollama Cloud</option>
            <option value="">Custom</option>
        </select>
        {#if apiRoute === ''}
        <input bind:value={apiRoute} placeholder="http://localhost:11434/api">
        {/if}
        {#if !apiRoute.startsWith('http://localhost')}
        <p>Replace API key (if applicable)</p>
        <input bind:value={enteredAPIKey} type="password">
        {/if}
   
         <div class="buttonRow">
        <div class="fatDiv">
            <button class="advancedButton" onclick={() => {settingsPage = 1}}><p>Back</p></button>
        </div>
            
        <div class="right">
        <button class="saveButton" style="background-color: #d17960;" onclick={saveSettings}>Save</button>
          <button class="saveButton" onclick={() => {
            settingsMenu = false;
            settingsPage = 1;
            
            passwordEntered = '';
          }}>Cancel</button>
          </div>
          </div>
        {/if} 
    </div>
   
<div class="profileWindow" class:hiddenMenu={hiddenProfileMenu}>
<p>You're currently logged in as</p>
<h2>{$user.userName}</h2>
<p>Select another profile to switch.</p>
{#each userList as userItem}
{#if userItem.userId != $user.userId}

<div class='userItemRow'>
<button class="userProfileButton" onclick={() => {
    user.set(userItem);
    localStorage.setItem('previousUser', JSON.stringify(userItem))
    goto('/home');
  
    chat.messages = [];
    chatArray = [];
    hiddenProfileMenu = true;
}}>
    <p>{userItem.userName}</p>
</button>
{#if userItem.userId != null}
<button onclick={() => {confirmUserDelete(userItem)}}>
   <CircleX></CircleX> 
   
</button>
{/if}
</div>
{/if}
{/each}
<div class='divider'></div>
<button class='newUserButton' onclick={() => {
    closeAll();
    openNewUserMenu();
    }}>New User</button>
</div>

<div class="leftMenu" class:hiddenMenu={!menuShown} >
{#if models && models.find(m => m.model === selectedModel)}
<select style="margin-top: 10px;" bind:value={selectedModel}>
    {#each models as model}
    <option value={model.model}>{model.name}</option>
    {/each}
</select>
{/if}
<div class="closePanelFullExtent">
  <h2 style="margin-top: 10px;">Chats:</h2>
     <button onclick={() => {
        closeAll();
}}><PanelLeft style='margin-top: 10px;'></PanelLeft></button>
</div>
{#if $user.userId}


    <p>Name:</p>
<input bind:value={chatName} placeholder="e.g, Capybara Olympics Pitch"> 
<button onclick={() => {newChat(chatName)}} class="newChat">Create New Chat</button>

<div class="divider"></div>
{#if chatArray.length >= 1}
{#each chatArray as chatItem}
{#if chatItem.chatId}
<div class="closePanelFullExtent">
{#if chatItem.chatId !== currentChatId}
    <button class="chatButton" onclick={() => {
goto(`/home?chat=${chatItem.chatId}`);
console.log('Going to', chatItem.chatId);
closeAll();
}}>
    <p>{chatItem.title}</p>
</button>
{:else}
    <button class="chatButton" style="background-color: #4d4d4d;" onclick={() => {
goto(`/home?chat=${chatItem.chatId}`);
console.log('Going to', chatItem.chatId);
closeAll();
}}>
    <p>{chatItem.title}</p>
</button>
{/if}

<button onclick={() => {openAlert(chatItem)}}>
   <CircleX></CircleX> 
</button>


</div>
{/if}
{/each}


{:else}
<p>No chats found, create one to get started!</p>
{/if}
<button class="settings" onclick={() => {
    closeAll();
    settingsMenu = !settingsMenu;
}}>
    <p>Settings</p>
    <Settings></Settings>
</button>
{:else}
<p>Guests can't create chats. Click the icon on the top right to select a profile or just continue as a guest.</p>
{/if}
</div>
<div class="topBar">
    {#if !menuShown}
     <button onclick={() => {
        closeAll();
        menuShown = !menuShown;
}}><PanelLeft></PanelLeft></button>
{:else}
<placeholder></placeholder>
{/if}

  <p class="koulen text-xl">
        <a href="/lighterDoc" class="koulen headLink">Lighter</a>
        <a href="/webDoc" class="koulen headLink">Web</a> 
        <a href="/uiDoc" class="koulen headLink">UI</a>
    </p>
   
<button onclick={() => {
    const open = !hiddenProfileMenu;
    closeAll();
    if(open) {
         hiddenProfileMenu = true;
    } else {
        hiddenProfileMenu = false
    }
   
}}>
    <img src="/guestIcon.png" class="pfp" alt="The guest's profile icon">
</button>
</div>



{#if errorMessage}
<div class="error">
     <p style="text-align: center;">{errorMessage}</p>
</div>

  {/if}
{#if chat.messages.length > 0}
<div class="messagesDiv mt-4" bind:this={element} onscroll={handleScrolling}>
 
    {#each chat.messages as message}
   
 
        {#if message.role == 'user'}
            <div class="userSide">
            <h2 style="margin-bottom: 10px;">You:</h2>
            {#if message.parts}
            {#each message.parts as part}
            {#if part.type === 'text'}
            <p>{part.text}</p>
            {/if}
            {/each}
            {/if}
        </div>
        
        {:else if message.role == 'assistant'}
            <h2>Assistant:</h2>

           {#each message.parts as part}

    {#if part.type.startsWith('tool-')}
    <p>Tool used: {part.type.slice(5)}</p>
    {/if}

            {#if part.type === 'text'}
            <div class="markedDiv">
                {@html marked(part.text)}
            </div>
            
            {/if}
            {/each}
            
        {/if}
    {/each}
        </div>
{/if}
        {#if chat.messages.length === 0}
        {#if currentChatId !== '' && $user.userId !== null}
            <h1>Welcome back, {$user.userName}</h1>
            {:else if $user.userId === null}
<h1 style="margin-bottom: 10px;">Welcome.</h1>
<p class="widthLP" style="text-align: center;">You're currently logged in as a guest. <br> No data will be saved from this session. <br> To log in, click the button at the top right and select a profile.</p>
        {:else}
        <h2>Hey, {$user.userName}!</h2>
<h1 style="margin: 10px; margin-top: 5px; text-align: center;">Open a chat to get started!</h1>
<p class="widthLP" style="text-align: center;">Click the button in the top left corner to open the chats menu.</p>

{/if}
{/if}

  
{#if currentChatId || $user.userId == null}
<div class="bottom">
{#if !tavilyAPIKey}
<button class="lilButton" onclick={() => alert('Web search API key is invalid or not found. Please enter in settings to enable web search functionality')}>
<GlobeOff size=20></GlobeOff>
</button>
{/if}

       <textarea bind:value={input} onkeydown={(e) => {if(e.key === 'Enter' && !e.shiftKey && !isLoading) {
        e.preventDefault();
        const cleanInput = input.trim();
        if(cleanInput) {
            sendPrompt(cleanInput);
            input = '';
        }

       } }}  placeholder="Why is the sky blue?"></textarea>
    
    {#if isLoading === false}
<button type='submit' class="lilButton" onclick={() => {
   
        const cleanInput = input.trim();
        if(cleanInput) {
            sendPrompt(cleanInput);
            input = '';
        }

       }}>
    <ArrowUp></ArrowUp>
</button>
{:else}
<button class="lilButton" onclick={abort} type="button">
    <CircleX></CircleX>
</button>
{/if}

</div>  

{/if}

{:else}
<h1>Loading...</h1>
{/if}
</div>


<style>
.smallTA {
    max-width: 100%;
    min-height: 100px;
    max-height: 200px;
}
.userItemRow {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
}
.buttonRow {
    width: auto;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px;
    align-items: center;
    gap: 20px;

}
.fatDiv {
    width: 20%;
    padding: 0;
    text-align: left;
}
.right {
    display: flex;
    flex-direction: row;
    gap: 10px;
    height: auto;
    width: auto;
}
.advancedButton {

color: rgb(98, 106, 207);
text-decoration: underline;
}
.widthLP {
    max-width: 85vw;
}
.userProfileButton {
     background-color: rgb(46, 46, 47);
    border-radius: 5px;
    padding: 5px;
    width: 100%;
}
.newUserButton {
    background-color: rgb(80, 86, 174);
    border-radius: 5px;
    padding: 5px;
}

.newUserMenu {
    opacity: 1;
    z-index: 2;
    box-shadow: 0px 4px 50px 10px rgba(0, 0, 0, 0.384);
    height: auto;
    width: auto;
    padding: 20px;
    gap: 10px;
    display: flex;
    flex-direction: column;
    transition: 0.3s;
       background-color: rgb(58, 58, 58);
    border-radius: 15px;
    position: fixed;
    top: 10%;
}
.newUserMenu.hiddenMenu {
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
}

.hiddenMenu {
    pointer-events: none;
}
.error {
    background-color: rgb(162, 117, 117);
    border: red 1px solid;
    padding: 20px;
    border-radius: 10px;
    color: white;
}
.markedDiv :global(a) {
    color: orange;
}

.saveButton {
    background-color: rgb(118, 124, 126);
    height: 40px;
    width: 70px;
    border-radius: 10px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  
}
.lilButton {
    transition: 0.2s;
}
.lilButton:hover {
    transform: scale(1.1);
}


.settingsMenu {
opacity: 1;
z-index: 2;
box-shadow: 0px 4px 20px 10px rgba(0, 0, 0, 0.384);
height: auto;
width: clamp(20rem, 25vw, 30rem);
padding: 20px;
gap: 10px;
display: flex;
flex-direction: column;
 transition: 0.3s;
background-color: rgb(58, 58, 58);
 border-radius: 20px;
 position: fixed;
 top: 15%;
}

.settingsMenu.hiddenMenu {
opacity: 0;
width: 0;
border-radius: 0;
height: 0;
}

.pfp {
width: 28px;
border: solid rgb(80, 86, 174) 3px;
border-radius: 50%;
image-rendering: optimizeQuality;
}
.markedDiv :global(pre) {
    background-color: #282c34;
    padding: 15px;
    margin-top: 15px;
    margin-bottom: 15px;
    border-radius: 20px;
}
.markedDiv :global(hr) {
    border: none;
height: 3px;
    width: 100%;
margin-top: 10px;
margin-bottom: 10px;
    background-color: rgb(74, 74, 74);
    border-radius: 30px;
}

.markedDiv :global(table) {
    border-collapse: collapse;
    background-color: #1f1f1f;
    margin: 20px;
    min-width: 100%;
    border-radius: 20px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}

.markedDiv :global(th),
.markedDiv :global(td) {
    padding: 12px 15px;
}
.settings {
   margin-top: auto;
    background-color: #2c2c2c;
    height: 40px;
    border-radius: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0px 15px 0px 15px;
    align-items: center;
}
.closePanelFullExtent {
    width: 100%;
    display: flex;
align-items: center;
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
     width: 90%;
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
    transition: 0.15s ease-out;
    transform-origin: left;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: auto;
 
padding: 10px 20px 10px 20px;

}

.profileWindow {
    height: auto;
    max-height: 600px;
    width: clamp(20rem, 20vw, 80vw);
    background-color: rgb(58, 58, 58);
    position: fixed;
    right: 20px;
    overflow: auto;
    top: 60px;
    z-index: 2;
    border-radius: 20px;
    opacity: 1;
    box-shadow:  0px 0px 20px 0px rgba(0, 0, 0, 0.405);
    transition: 0.2s ease-out;
    transform-origin: right;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
}

.profileWindow.hiddenMenu {
    opacity: 0;
transform: scaleX(0);
}

.leftMenu.hiddenMenu {
opacity: 0;
transform: scaleX(0);
}





h2 {
    font-size: 20px;
    font-weight: 500;
    line-height: 1;
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
    overflow-x: hidden;
    padding: clamp(4rem, 20vw, 30rem);
    padding-top: 20px;
    padding-bottom: 20px;
    word-break: normal;
    padding: 20px;
    max-width: 80vw;

}

 .koulen {
     font-family: "koulen", sans-serif;
 }

 a {
    text-decoration: underline;
    color: black;
 }

 .headLink {
    transition: 0.2s;
      max-height: 4vh;
      color: white;
      text-decoration: none;
 }
 .headLink:hover {
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
     line-height: 1.0;
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
    align-items: center;
    gap: 10px;
 }

 select {
    background-color: #2c2c2c;
    border-radius: 30px;

 }
</style>