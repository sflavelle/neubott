const Chariot = require('chariot.js');
const FS = require("fs");

class Raocowisms extends Chariot.Command {
    constructor() {
        super();

        this.name = 'raocowisms';
        this.allowDMs = true;
        this.cooldown = 3;
        this.aliases = ['demo','raocow'];
        this.subcommands = ['add', 'remove'];
        this.help = {
            message: "Hey there everyone",
            usage: 'raocowisms',
            example: ['raocowisms', 'raocowisms add <text>'],
            inline: true
        }
    }

    async add(message, args, chariot){
        Chariot.Logger.event("Adding to raocowisms: args: '" + args.join(' ') + "'");
        let file = ( FS.existsSync('./resources/raocowisms.json') ) ? JSON.parse(FS.readFileSync('./resources/raocowisms.json', 'utf8')) : new Array(); //Load the file into memory and parse it
        var newresponse = args.join(' ');
        file.push(newresponse);
        FS.writeFileSync('./resources/raocowisms.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/raocowisms.json') }
        })
        message.channel.createMessage("✅ You know what they say: **" + file.length + "** raocow quotes will probably make you sick eventually.\nHere's what I just added: `" + newresponse + "`");
    }

    async remove(message, args, chariot){
        Chariot.Logger.event("Removing from raocowisms: args: '" + args.join(' ') + "'");
        var file = JSON.parse(FS.readFileSync('./resources/raocowisms.json', 'utf8')); //Load the file into memory and parse it
        var searchtext = args.join(' ');
        const searchindex = (element) => element.includes(searchtext);
        let delIndex = file.findIndex(searchindex);
        let deletedtext = file[delIndex];
        file.splice(delIndex,1);
        FS.writeFileSync('./resources/raocowisms.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/raocowisms.json') }
        })
        message.channel.createMessage("✅ Deleted. That was a demo, y'know?\nWe removed: `" + deletedtext + "`");
    }

    async execute(message, args, chariot) {
            var file = JSON.parse(FS.readFileSync('./resources/raocowisms.json', 'utf8')); //Load the file into memory and parse it
            var response = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
            message.channel.createMessage("<:catplanet:642306198443655178> " + response); //Print it
    }
}

module.exports = new Raocowisms;