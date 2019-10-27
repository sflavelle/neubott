const Chariot = require('chariot.js');
const FS = require("fs");

class BotFacts extends Chariot.Command {
    constructor() {
        super();

        this.name = 'facts';
        this.cooldown = 3;
        this.aliases = ['botfacts','bucketfacts'];
        this.subcommands = ['add'];
        this.help = {
            message: "Neubott has a lot of true, definitely real facts",
            usage: 'facts',
            example: ['facts','botfacts', 'facts add <text>'],
            inline: true
        }
    }

    async add(message, args, chariot){
        Chariot.Logger.event("Adding to facts: args: '" + args.join(' ') + "'");
        var file = JSON.parse(FS.readFileSync('./resources/facts.json', 'utf8')); //Load the file into memory and parse it
        var newresponse = args.join(' ');
        file.push(newresponse);
        FS.writeFileSync('./resources/facts.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/facts.json') }
        })
        message.channel.createMessage("✅ Saved! That's **" + file.length + "** totally true real things I know now.\nHere's what I just added: `" + newresponse + "`");
    }

    async execute(message, args, chariot) {
            var file = JSON.parse(FS.readFileSync('./resources/facts.json', 'utf8')); //Load the file into memory and parse it
            var response = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
            message.channel.createMessage(":microphone2: " + response); //Print it
    }
}

module.exports = new BotFacts;