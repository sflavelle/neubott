const Chariot = require('chariot.js');
const FS = require("fs");

class GimmeSquids extends Chariot.Command {
    constructor() {
        super();

        this.name = 'gimmesquids';
        this.cooldown = 3;
        this.aliases = ['squids'];
        this.subcommands = ['add', 'remove'];
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
        const searchindex = (element) => element.includes(newresponse);
        if (file.findIndex(searchindex) !== -1) {
            let oldtextIndex = file.findIndex(searchindex);
            let oldtext = file[oldtextIndex];
            message.channel.createMessage("💥 That already exists in my database!\nThe older message says: `" + oldtext + "`");
            return;
        };
        file.push(newresponse);
        FS.writeFileSync('./resources/splat.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/splat.json') }
        })
        message.channel.createMessage("✅ Saved! I now have **" + file.length + "** cephalopods.\nHere's what I just added: `" + newresponse + "`");
    }

    async remove(message, args, chariot){
        Chariot.Logger.event("Removing from splat: args: '" + args.join(' ') + "'");
        var file = JSON.parse(FS.readFileSync('./resources/splat.json', 'utf8')); //Load the file into memory and parse it
        var searchtext = args.join(' ');
        const searchindex = (element) => element.includes(searchtext);
        if (file.findIndex(searchindex) !== -1) {
            let searchMatches = file.reduce(function(a, e, i){
                if (e.search(searchtext) !== -1)
                a.push(i);
                return a;
            }, []); // source: https://stackoverflow.com/a/20798754
            // message.channel.createMessage("⌨ match results: `" + searchMatches.join(",") + "`");
            if (searchMatches.length > 1) {
                Chariot.Logger.event(`Removing from splat: too many matches (${searchMatches.length})`);
                message.channel.createMessage(`💥 There are too many matches for that string (**${searchMatches.length}**)!\nPlease be more specific and match **only** one item.`);
                return;
            } else {
                let delIndex = file.findIndex(searchindex);
                let deletedtext = file[delIndex];

                file.splice(delIndex,1);
                FS.writeFileSync('./resources/splat.json', JSON.stringify(file, null, 2), function (err) {
                    if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/splat.json') }
                })
                message.channel.createMessage("<:Splatted:606703438730100766> Deleted. I now have **" + file.length + "** cephalopods.\nWe removed: `" + deletedtext + "`");
                Chariot.Logger.event(`Removing from splat: removed`);
                }} else {
                message.channel.createMessage("💥 Nothing matches that.");
                Chariot.Logger.event(`Removing from splat: no matches`);
                return;
                };
    }

    async execute(message, args, chariot) {
            var file = JSON.parse(FS.readFileSync('./resources/splat.json', 'utf8')); //Load the file into memory and parse it
            var response = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
            message.channel.createMessage(response); //Print it
    }
}

module.exports = new GimmeSquids;