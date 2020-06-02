const Chariot = require('chariot.js');
const FS = require("fs");

class GiveMeAJam extends Chariot.Command {
    constructor() {
        super();

        this.name = 'givemeajam';
        this.allowDMs = true;
        this.cooldown = 3;
        this.aliases = ['jam', 'jams'];
        this.subcommands = ['add', 'remove'];
        this.help = {
            message: 'Returns a random tune from the community listing.',
            usage: 'givemeajam',
            example: ['givemeajam', 'givemeajam add <url>'],
            inline: true
        }
    }

    async add(message, args, chariot){
        Chariot.Logger.event("Adding to jams: args: '" + args.join(' ') + "'");
        var file = (FS.existsSync('./resources/jams.json')) ? JSON.parse(FS.readFileSync('./resources/jams.json', 'utf8')) : new Array(); //Load the file into memory and parse it
        var newresponse = args.join(' ');
        const searchindex = (element) => element.includes(newresponse);
        if (file.findIndex(searchindex) !== -1) {
            let oldtextIndex = file.findIndex(searchindex);
            let oldtext = file[oldtextIndex];
            message.channel.createMessage("💥 That already exists in my database!\nThe older message is: `" + oldtext + "`");
            return;
        };
        file.push(newresponse);
        FS.writeFileSync('./resources/jams.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/jams.json') }
        })
        message.channel.createMessage("✅ Saved! I now have **" + file.length + "** bangin' tunes.\nHere's what I just added: `" + newresponse + "`");
    }

    async remove(message, args, chariot){
        Chariot.Logger.event("Removing from jams: args: '" + args.join(' ') + "'");
        try {
            var file = JSON.parse(FS.readFileSync('./resources/jams.json', 'utf8'));
        } catch (e) {if (e.code === "ENOENT") {message.channel.createMessage("💥 I don't have anything yet!"); return null;}};
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
                Chariot.Logger.event(`Removing from jams: too many matches (${searchMatches.length})`);
                message.channel.createMessage(`💥 There are too many matches for that string (**${searchMatches.length}**)!\nPlease be more specific and match **only** one item.`);
                return;
            } else {
                let delIndex = file.findIndex(searchindex);
                let deletedtext = file[delIndex];

                file.splice(delIndex,1);
                FS.writeFileSync('./resources/jams.json', JSON.stringify(file, null, 2), function (err) {
                    if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/jams.json') }
                })
                message.channel.createMessage("✅ Deleted. I now have **" + file.length + "** jammin' jams.\nWe removed: `" + deletedtext + "`");
                Chariot.Logger.event(`Removing from jams: removed`);
                }} else {
                message.channel.createMessage("💥 Nothing matches that.");
                Chariot.Logger.event(`Removing from jams: no matches`);
                return;
                };
    }

    async execute(message, args, chariot) {

        try {
            var file = JSON.parse(FS.readFileSync('./resources/jams.json', 'utf8'));
        } catch (e) {if (e.code === "ENOENT") {message.channel.createMessage("💥 I don't have anything yet!"); return null;}};

        if (args === undefined || args.length == 0) {}
        else {
            file = file.filter(link => link.toLowerCase().includes(args.join(" ").toLowerCase()));
            if (file.length == 0) {message.channel.createMessage("💥 Nothing matches that."); return null;}
        }
        var response = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
        message.channel.createMessage(response); //Print it
    }
}

module.exports = new GiveMeAJam;