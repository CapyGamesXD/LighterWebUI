<script>
    //@ts-nocheck

    let input = $state('');
    let reply = $state('loading...');

    async function sendPrompt() {
        const prompt = input.trim();
        
        if(prompt) {
             const response = await fetch('/API', {
			method: 'POST',
			body: JSON.stringify({ messages }),
			headers: {
				'Content-Type': 'application/json'
			}
            
		});

        const data = await response.json();
        reply = data.reply;

        } else {
            console.log('Prompt is empty!')
        }

        
       
    }


</script>
<p>Welcome!</p>
<input bind:value={input}>
<button onclick={sendPrompt}>Send</button>
<p>{reply}</p>