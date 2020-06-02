const Chariot = require('chariot.js');
const FS = require("fs");

class BotFacts extends Chariot.Command {
    constructor() {
        super();

        this.name = 'facts';
        this.allowDMs = true;
        this.cooldown = 3;
        this.aliases = ['botfacts','bucketfacts'];
        this.subcommands = ['add', 'remove'];
        this.help = {
            message: "Neubott has a lot of true, definitely real facts",
            usage: 'facts',
            example: ['facts','botfacts', 'facts add <text>'],
            inline: true
        }
    }

    async add(message, args, chariot){
        Chariot.Logger.event("Adding to facts: args: '" + args.join(' ') + "'");
        var file = (FS.existsSync('./resources/facts.json')) ? JSON.parse(FS.readFileSync('./resources/facts.json', 'utf8')) : new Array(); //Load the file into memory and parse it
        var newresponse = args.join(' ');
        file.push(newresponse);
        FS.writeFileSync('./resources/facts.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/facts.json') }
        })
        message.channel.createMessage("✅ Saved! That's **" + file.length + "** totally true real things I know now.\nHere's what I just added: `" + newresponse + "`");
    }

    async remove(message, args, chariot){
        Chariot.Logger.event("Removing from facts: args: '" + args.join(' ') + "'");
        try {
            var file = JSON.parse(FS.readFileSync('./resources/facts.json', 'utf8'));
        } catch (e) {if (e.code === "ENOENT") {message.channel.createMessage("💥 I don't have anything yet!"); return null;}};

        var searchtext = args.join(' ');
        const searchindex = (element) => element.includes(searchtext);
        let delIndex = file.findIndex(searchindex);
        let deletedtext = file[delIndex];
        file.splice(delIndex,1);
        FS.writeFileSync('./resources/facts.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/facts.json') }
        })
        message.channel.createMessage("✅ Deleted. I now have **" + file.length + "** real ~~fake~~ facts.\nWe removed: `" + deletedtext + "`");
    }

    async execute(message, args, chariot) {
        try {
            var file = JSON.parse(FS.readFileSync('./resources/facts.json', 'utf8'));
        } catch (e) {if (e.code === "ENOENT") {message.channel.createMessage("💥 I don't have anything yet!"); return null;}};
            var response = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
            message.channel.createMessage(":microphone2: " + response); //Print it
    }
}

module.exports = new BotFacts;