const Chariot = require('chariot.js');
const FS = require("fs");

class WhatDidIMiss extends Chariot.Command {
    constructor() {
        super();

        this.name = 'whatdidimiss';
        this.cooldown = 3;
        this.aliases = ['whatimissed'];
        this.subcommands = ['add', 'remove'];
        this.help = {
            message: 'Will helpfully inform you of all the things you "missed"',
            usage: 'whatdidimiss',
            example: ['whatdidimiss','whatimissed', 'whatdidimiss add <text>'],
            inline: true
        }
    }

    async add(message, args, chariot){
        Chariot.Logger.event("Adding to whatdidimiss: args: '" + args.join(' ') + "'");
        var file = JSON.parse(FS.readFileSync('./resources/whatimissed.json', 'utf8')); //Load the file into memory and parse it
        var newresponse = args.join(' ');
        file.push(newresponse);
        FS.writeFileSync('./resources/whatimissed.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/whatimissed.json') }
        })
        message.channel.createMessage("✅ Saved! You've now missed **" + file.length + "** things. Wow.\nHere's what I just added: `" + newresponse + "`");
    }

    async remove(message, args, chariot){
        Chariot.Logger.event("Removing from whatimissed: args: '" + args.join(' ') + "'");
        var file = JSON.parse(FS.readFileSync('./resources/whatimissed.json', 'utf8')); //Load the file into memory and parse it
        var searchtext = args.join(' ');
        const searchindex = (element) => element.includes(searchtext);
        let delIndex = file.findIndex(searchindex);
        let deletedtext = file[delIndex];
        file.splice(delIndex,1);
        FS.writeFileSync('./resources/whatimissed.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/whatimissed.json') }
        })
        message.channel.createMessage("✅ Deleted. I'll now miss **" + file.length + "** things.\nWe removed: `" + deletedtext + "`");
    }

    async execute(message, args, chariot) {
            var file = JSON.parse(FS.readFileSync('./resources/whatimissed.json', 'utf8')); //Load the file into memory and parse it
            var response = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
            message.channel.createMessage(response); //Print it
    }
}

module.exports = new WhatDidIMiss;