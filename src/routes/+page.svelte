<script>
//@ts-nocheck
	import { onMount } from "svelte";

    let page = $state(1);
    let password = $state()
    async function fetchPass () {
        const response = await fetch('/API/database/generatePassword', {method: 'POST', headers: {'Content-Type': 'application/json'}})
        password = await response.json();
    }
    onMount(() => {
        fetchPass();
    })
    
</script>
{#if page === 1 && password} 
<h1>Your Admin Password:</h1>
<p>The freshly generated password is: {password}</p>
<p>Save this and don't let anyone else see it.</p>
{:else if password === false}
<h1>Password has already been generated! Please go to the <a href="/home">Home page</a></h1>
{/if}

<style>
    a {
        color: orange;
    }
</style>