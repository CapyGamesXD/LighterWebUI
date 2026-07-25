<script>
//@ts-nocheck
    let page = $state(1);
    let password = $state('')
    async function fetchPass () {
        const response = await fetch('/API/database/generatePassword', {method: 'POST', headers: {'Content-Type': 'application/json'}})
        password = await response.json();
    }
</script>
{#if page === 1}
<button onclick={fetchPass}>Generate Password</button>
<p>The freshly generated password is: {password}</p>
{/if}