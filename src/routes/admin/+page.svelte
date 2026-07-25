<script>

//@ts-nocheck
    let authed = $state(false);
    let password = $state('')

    async function testPassword () {
       const response = await fetch('/API/auth', {body: JSON.stringify({
        passwordEntered: password
       }), 
        method: 'POST', 
         headers: {  
            'Content-Type': 'application/json'
        }})



        if(!response.ok) {
            alert("Incorrect password.")
            authed = false;
        } else {
            authed = true;
        }
    }

    async function saveUpdates () {
        testPassword();

        if(authed === true) {
             const response = await fetch('/API/database/newRoute', {method: 'POST', body: JSON.stringify({ollamaAPIKey, apiRoute}), 
    headers: {  
            'Content-Type': 'application/json'
    }})
        }
    }
</script>

<div class="middle">  
<h1>Admin page:</h1> 
    {#if !authed}
<h2 style="margin-top: 10px; margin-bottom: 5px;">Authenticate to continue.</h2>
<div class="divider"></div>
    <p style="margin-top: 5px;">Password:</p>
<input style="margin-top: 2px;"  placeholder="E.g, ABC123" type="password" bind:value={password}>
<button onclick={testPassword}>Enter</button>

    {:else}
       
    {/if}
    
</div>

<style>
.divider {
    width: 50px;
    background-color: #191919;
    height: 3px;
    border-radius: 30px;
}
.middle {
    display: flex;
    flex-direction: column;
    align-items: center;
}
h1 {
    font-size: 30px;
}

input {
    width: 200px;
    background-color: #191919;
    text-align: center;
    border-radius: 30px;
}
</style>