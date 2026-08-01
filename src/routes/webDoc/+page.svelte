<script>
    import { House } from 'lucide-svelte';
</script>
<div class="center">
<a href="/" style="margin-top: 20px; "><House></House></a>
<div class="yapBlock" style="margin-top: 20px;">
     <h1>Web</h1>
    <div style="margin-top: 5px;" class="divider"></div>
<p style="margin: 20px;">LighterWebUI is made entirely using SvelteKit. This offers an enhanced development experience, giving features like their incredible $state() management. You would think that would increase the build bundle size, but no! SvelteKit compiles the same as any plain HTML, CSS and JS website. I'm not at all affiliated with SvelteKit, but I just really like using it. This simple bundle allows the website to stay lightweight for the server and the client. Being a website, LighterWebUI can run on anything that has a browser, from your laptop to your smart fridge! (Disclaimer: I haven't tested it on a smart fridge, but - assuming it runs a normal Chromium/WebKit browser, it should work XD) <br> The entire website is open source and available on GitHub. Go check it out <a href="https://github.com/CapyGamesXD/LighterWebUI" target="_blank" style="color: orange;">here</a>! Also, one quick thing. I wish I didn't have to say this, but this website is NOT vibe-coded! I made it myself across about 40-50 hours of coding, writing thousands of lines MYSELF. AI was used lightly for research and debugging, but the code is mine. :D </p>

</div>
   
</div>

<style>
.yapBlock {
    width: clamp(25rem, 50vw, 80rem);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background-color: #3D3D3D;
    border-radius: 20px;
    height: 50%;
}
.divider {
    width: 100px;
    height: 3px;
    border-radius: 30px;
    background-color: #3D3D3D;
}
.center {
    display: flex;
    align-items: center;
    flex-direction: column;
}
  h1 {
    font-size: 40px;
    font-family: Oswald, sans-serif;

     text-align: center;
}

</style>