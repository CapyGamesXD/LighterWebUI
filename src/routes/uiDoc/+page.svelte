<script>
    import { House } from 'lucide-svelte';
</script>
<div class="center">
<a href="/home" style="margin-top: 20px; "><House></House></a>
<div class="yapBlock" style="margin-top: 20px;">
     <h1>UI</h1>
    <div style="margin-top: 5px;" class="divider"></div>
<p style="margin: 20px;">I designed the UI for LighterWebUI using Figma. I aimed for a sleek, simple design, while keeping the minimalist, lightweight goal in mind. I found a balance that worked great. I recieved feedback from some friends about the UI and developed it from there, making tons of changes during the implementation phase. For the icons, I used Lucide.dev, a great (and open source!) place to get some nice icons! The website's logo I made myself with my hour and a half of Inkscape experience! It's made to represent a planet, orbited by two moons. You could think of the planet as the "Lighter" and the moons as "Web" and "UI" if you want hehe XD</p>

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