<script>
    import { House } from 'lucide-svelte';
</script>
<div class="center">
<a href="/home" style="margin-top: 20px; "><House></House></a>
<div class="yapBlock" style="margin-top: 20px;">
     <h1>Lighter</h1>
    <div style="margin-top: 5px;" class="divider"></div>
<p style="margin: 20px;">I made LighterWebUI to be a more RAM-efficient alternative to something like OpenWebUI. I'm very happy with how it turned out. <br> According to my measurements, it uses under 100MB of RAM, and - thanks to its small files and pages, allows for many simultaneous users with no notable performance drop on something as small as a Raspberry Pi! <br><br> This project is not designed as a replacement/modification of OpenWebUI. In fact, it offers a much simpler experience with far fewer features. I ommitted the features that people who would reasonably need an efficient project like this would not often use. By that I mean if you're willing to go that deep into website/AI model customisation, you're likely willing to buy some hardware capable of using OpenWebUI :D</p>

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