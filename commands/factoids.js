const Chariot = require('chariot.js');
const FS = require("fs");
const flatten = require('array-flatten')

class Factoids extends Chariot.Command {
    constructor() {
        super();

        this.name = 'factoids';
        this.cooldown = 3;
        this.subcommands = ['add'];
        this.help = {
            message: "Factoids about things!",
            usage: 'factoids',
            example: ['factoids', 'factoids add <person/thing> [factoid]'],
            inline: true
        }
    }

    async add(message, args, chariot){
        Chariot.Logger.event("Adding to factoids: args: '" + args.join(' ') + "'");
        let file = ( FS.existsSync('./resources/factoids.json') ) ? JSON.parse(FS.readFileSync('./resources/factoids.json', 'utf8')) : new Array(); //Load the file into memory and parse it
        var factoidSubject = (args[0].search(/^"/) != -1) ? args.join(' ').match(/^"(.+?)"/)[1] : args.shift();
        var factoidText = (args[0].search(/^(is|has)$/i) != -1) ? factoidSubject + " " + args.join(' ') : args.join(' ');
        Chariot.Logger.event("FACTOIDS: Subject: " + factoidSubject);
        Chariot.Logger.event("FACTOIDS: Text: " + factoidText);
        if (file[factoidSubject]) {
            file[factoidSubject].push(factoidText);
        } else {
            file[factoidSubject] = [];
            file[factoidSubject].push(factoidText);
        }
                FS.writeFileSync('./resources/factoids.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed',err) }
        })
        message.channel.createMessage("✅ Saved! That's **" + file[factoidSubject].length + "** thing(s) I know about " + factoidSubject + ".\nHere's what I just added: `" + factoidText + "`");
    }

    async execute(message, args, chariot) {
        try {
            var file = JSON.parse(FS.readFileSync('./resources/factoids.json', 'utf8')); //Load the file into memory and parse it
            flatten(file);
            var response = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
            message.channel.createMessage(":microphone2: " + response); //Print it
        } catch (e) {message.channel.createMessage("❌ There was a problem: `" + e.message + "`");}
    }
}

module.exports = new Factoids;