# Neubott Command/Event Files

These are a bunch of random scripts and commands I made for my simple Discord bot, which uses the [Chariot.js](https://github.com/riyacchi/chariot.js) framework.

While I've written Javascript code occasionally before, up til this point it was hacked together or modifying existing Discord bot software (this bot was previously using a combination of [Red-DiscordBot](https://github.com/Cog-Creators/Red-DiscordBot) and Node-RED). Besides the framework and underlying API, this code is my attempt to put what I know of Javascript to use in making a bot that is completely my own.

## Usage/Installation

Drop any .js files you'd like into your Chariot.js-based bot's directory, and it should load automatically.

A lot of the commands rely on their own JSON array. They should be created on their own - but if they don't, you may feel free to use the ones provided (for now they MUST be in a `resources` folder in the directory that contains your index.js).

The `facts` and `deathmsgs` files go in a subdirectory - see the resources folder for an example. Name them `global.json` to apply to all servers, or name them after your guild ID to have them only apply to a single server. At run time the relevant commands/events will mix the server-specific and global files to return a random response.

## Contributions

As my goal is to learn more of Javascript in the process of making these commands, issues and pull requests are welcomed but not necessary.

Please keep a polite tone - if you think I could have done something better, it's more likely than not I don't know the best way to do something!

## TODO

- Allow config of array file names
- Automatically initialise array if one does not exist where needed
- Implement error handling, especially in regards to file i/o errors
- Implement from the old Neubott:
  - factoids about users
  - simple web system for getting quotes/facts/etc, getting files for authed users
