const Chariot = require('chariot.js');
const FS = require("fs");

class GimmeSquids extends Chariot.Command {
    constructor() {
        super();

        this.name = 'gimmesquids';
        this.cooldown = 3;
        this.aliases = ['squids'];
        this.subcommands = ['add'];
        this.help = {
            message: 'Returns a variety of squids, octopi, and other creatures from the Splatoon series! Tries its best to link to the source where possible.',
            usage: 'gimmesquids',
            example: ['gimmesquids', 'squids add <text or an url>'],
            inline: true
        }
    }

    async add(message, args, chariot){
        Chariot.Logger.event("Adding to splat: args: '" + args.join(' ') + "'");
        var file = JSON.parse(FS.readFileSync('./resources/splat.json', 'utf8')); //Load the file into memory and parse it
        var newresponse = args.join(' ');
        file.push(newresponse);
        FS.writeFileSync('./resources/splat.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/splat.json') }
        })
        message.channel.createMessage("✅ Saved! I now have **" + file.length + "** cephalopods.\nHere's what I just added: `" + newresponse + "`");
    }

    async execute(message, args, chariot) {
            var file = JSON.parse(FS.readFileSync('./resources/splat.json', 'utf8')); //Load the file into memory and parse it
            var response = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
            message.channel.createMessage(response); //Print it
    }
}

module.exports = new GimmeSquids;