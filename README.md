# Neubott Discord Bot

Neubott is a coding project in order to learn more of JavaScript and NodeJS. It uses the Discord.js API.

This branch is a rewrite of the original code, which was built on the Chariot.js framework on top of the Eris API.

## Features

This bot has a few interesting features at the moment that may make it worth checking out in future:

- Server quotes! Take your friends out of context!
- Splatoon 2 map schedule + Salmon Run + Splatfest support
- Big Emojis.
- A few simple commands to get and retrieve messages and links

In the future I plan for it to have all of the featureset from the original version of the bot, including:

- Posting random messages when set channels are 'idle'

And when it's 'done' it will also have:

- A simple API/web interface to look at each command's database
- Per-guild command settings
- Per-guild idle settings 

## Usage/Installation

This isn't ready for production use by others yet, but if you have a discord.js bot setup following the [Discord.js Guide](https://discordjs.guide/), you can drop the command files into your commands folder.

Be sure to install any prerequisite modules first:

- Many commands that use a database use `Sequelize`.
- The Splatoon schedule command uses `humanize-duration` to format time durations and `axios` for the HTTP/JSON requests.
- The quote command will also use `moment`. (OK, it doesn't *yet*, but it will need it to parse date strings users supply.)

## Contributions
Issues and pull requests are welcomed. Please keep a polite tone - if you think I could have done something better, it's more likely than not I don't know the best way to do something!