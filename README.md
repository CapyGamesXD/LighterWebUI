# LighterWebUI

LighterWebUI is a user-friendly interface for Ollama models. It's quick to set up and (according to my tests) uses as little as under 70MB of RAM at idle.

To install it, run:
```bash
git clone https://github.com/CapyGamesXD/LighterWebUI
cd ~/LighterWebUI
bun install
```
To run build and start it, run:
```bash
bun run build
bun run start
```

# Stats:

With several browser tabs open, it increases by only a few MB. These values can (of course) fluctuate greatly across systems (and other conditions), and is highly dependent on the number of concurrent users and processes. 
When running the OpenWebUI Docker container, RAM usage can be between 300MB and 1.5GB depending largely on configuration and user count.

I was inspired to make it when I tried running OpenWebUI + Ollama on my Raspberry Pi 5 4gb. It was... Not the greatest experience XD

It worked, but super slowly, and had that 'one wrong click and it'll crash!' feeling about it. That's why I made LighterWebUI.
This project was made for a YSWS (you ship, we ship) from Hackclub called [Stardance](https://stardance.hackclub.com).
OpenWebUI is an incredible, and frankly far more versatile tool than LighterWebUI, but also one with different applications. All of those features come at the cost of RAM. My goal was to run an LLM locally only on a Raspberry Pi, and that works great!

LighterWebUI isn't just a lighter version of OpenWebUI, it's different. Instead of being designed for thousands of worldwide users, it's designed to be hosted locally within a family/small group.

# The Stack:

It's made around the SvelteKit framework, as it massively improves the development experience with its $state() variables. It compiles into a normal HTML, CSS and JS website, which uses very little RAM to serve. 
It's recommended to host it using Bun, since it's much lighter on RAM than Node. 

# Features:
## User management
LighterWebUI has a very simple user system. It's similar to what you'd see in streaming platforms like Netflix. You select a profile, and you're in!
SvelteKit offers built-in XSS injection protection.

## Cloud compatibility:
With LighterWebUI, you can run LLMs locally (on the server), on the cloud (Ollama), or at a custom route, meaning regardless of your Ollama hosting route, you can use LighterWebUI. 

## Security:
LighterWebUI has a built-in password generator. It only shows the password once for security, so make sure to note it down.

Disclaimers: 

This project is intended for local LLM hosting, but - should you decide to use a cloud provider (like Ollama), data (including API keys) is stored either in localStorage or in the database.
These remain unencrypted under the assumption that only authorised individuals can access the database.
If you decide to deploy this project (which I hope you do :D), your data is your own responsibility.


To clarify, this is not a modified version of the existing OpenWebUI project, and is entirely separate, with no affiliation. 
I removed some of the 'bloat' features that I never found myself using.
