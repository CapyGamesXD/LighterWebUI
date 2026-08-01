<script>
//@ts-nocheck
	import { onMount } from "svelte";
import { Copy } from 'lucide-svelte';
import { goto } from "$app/navigation";
    let page = $state(1);
    let password = $state()
    let copyAccess = $state(true)
    let newUserName = $state('');
    let isUserNew = $state(true)
    function testCopy () {
        try {

        navigator.clipboard.writeText('');
        copyAccess = true;
        } catch(e) {
copyAccess = false;
        }
    }
    function copyPass () {
        try {
        navigator.clipboard.writeText(password);
        copyAccess = false;
        } catch (e) {
        alert('Something went wrong while copying. Please copy manually.')
        }  
    }

    async function fetchPass () {
        const response = await fetch('/API/database/generatePassword', {method: 'POST', headers: {'Content-Type': 'application/json'}})
        password = await response.json();
    }

    async function newUser() {
    if(newUserName) {
        try {
    const response = await fetch('/API/database/newUser', {method: 'POST', body: JSON.stringify({newUserName}), 
    headers: {  
            'Content-Type': 'application/json'
        }})
    page++;
        } catch (e) {
            alert("Something went wrong!", e)
        }
    } else if (!newUserName) {
        alert('Enter a valid username.')
    }

}
function finishSetup () {
    localStorage.setItem('isUserNew', JSON.stringify(false));
    goto('/home')
}
    
    onMount(async () => {
        isUserNew = localStorage.getItem('isUserNew') || true;
console.log("isUserNew:", isUserNew)
        if(isUserNew === false) {
            console.log("Going home")
            goto('/home')
        }
        testCopy();
        await fetchPass();
    })
    //generatePassword will return a password if one hasn't been generated, and false if it has. 
</script>
<div class="bubbles">
    
{#if page === 1} 

<div class="topBar">
   
  <p class="koulen text-xl">
        <a href="/lighterDoc" class="koulen headLink">Lighter</a>
        <a href="/webDoc" class="koulen headLink">Web</a> 
        <a href="/uiDoc" class="koulen headLink">UI</a>
    </p>

</div>
<h1>Lighter Web UI</h1>
<div class="divider"></div>
<p style="margin-top: 5px;">A faster, more secure way to enjoy AI</p>
<button class="reallyFancySparklyButton" onclick={() => page++} style="margin-top: 10px;">Start the Magic!</button>
{:else if page === 2 && password}
<h1>Your Admin Password:</h1>
<p>The freshly generated password is: {password}</p>
<div class="passwordBox" style="margin: 10px;">
    {#if copyAccess}
    <button class="copyButton" onclick={copyPass}><Copy /></button>
    {/if}
    <p>{password}</p></div>
<p>Save this and don't let anyone else see it.</p>
<button class="reallyFancySparklyButton" onclick={() => page++} style="margin-top: 10px;">Next</button>
{:else if page === 3}
<h1>Great! Let's continue.</h1>
<p>LighterWebUI needs <a target="_blank" href="https://ollama.com">Ollama</a> to run local inference. <br> If you don't already have it running, please install it, ideally within a <a href="https://www.docker.com" target="_blank">Docker container</a>. <br> If you don't need/want to run it locally, you can use the <a href="https://docs.ollama.com/cloud" target="_blank">Ollama Cloud API.</a> <br> Feel free to do this later. It's not needed right now!</p>
<button class="reallyFancySparklyButton" onclick={() => page++} style="margin-top: 10px;">I'm ready!</button>
{:else if page === 4}
<h1>YAY! Almost there!</h1>
<p>Let's make a user profile for you. What do you want to be called?</p>
<input style="margin-top: 5px; margin-bottom: 5px;" placeholder="E.g, Dad" bind:value={newUserName}>
<button class="reallyFancySparklyButton" onclick={newUser} style="margin-top: 10px;">That's me!</button>
{:else if page === 5}
<h1>Great choice, {newUserName}!</h1>
<p>We're almost done! If you need any help with anything or come across any issues, please check the docs or log them in <a href="https://github.com/CapyGamesXD/LighterWebUI">the repo</a>!</p>
<button class="reallyFancySparklyButton" onclick={finishSetup} style="margin-top: 10px;">Let's GO!</button>
{:else if password === false}
<h1>You've already completed the setup. Please go to the <a href="/home">Home page</a></h1>
{/if}
</div>
<style>
input {
    width: 200px;
    background-color: #3D3D3D;
    border-radius: 10px;
    padding: 10px;
}
.copyButton {
    transition: 0.2s;
}
.copyButton:active {
    transform: scale(1.05);
}
.reallyFancySparklyButton {
    width: 250px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(90deg,rgba(242, 149, 144, 1) 0%, rgba(150, 156, 219, 1) 50%, rgba(118, 149, 120, 1) 100%);
    color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 0%;
    transition: 0.2s;
}
.reallyFancySparklyButton:hover {
box-shadow: inset 0px -5px 0px 0px rgba(0, 0, 0, 0.471);
    padding-bottom: 5px; 

}

p {
    text-align: center;
    max-width: clamp(20rem, 30%, 80rem);
}
.passwordBox {
    background-color: #3D3D3D;
    width: 250px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
align-items: center;
    padding: 10px;
}
.passwordBox > p {
 position: absolute;
    text-align: center;
    left: 50%;
    transform: translateX(-50%);
}
.divider {
    width: 100px;
    height: 3px;
    border-radius: 30px;
    background-color: #3D3D3D;
}
h1 {
    font-size: 40px;
    font-family: Oswald, sans-serif;
     max-width: clamp(20rem, 30%, 80rem);
     text-align: center;
}
    .bubbles {
        background-image: url('/bubblesBg.jpg');
        background-position: center;
        background-size: cover;
        min-height: 100vh;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
    }
    a {
        color: orange;
    }

    .headLink {
        color: white;
    }

    .koulen {
        font-family: Koulen, sans-serif;
    }

    .topBar {
        align-items: center;
        justify-content: center;
  
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
</style>