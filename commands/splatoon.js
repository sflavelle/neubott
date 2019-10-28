const Chariot = require('chariot.js');
const FS = require("fs");
const http = require('https');

class Splatoon extends Chariot.Command {
    constructor() {
        super();

        this.name = 'splatoon';
        this.cooldown = 600;
        this.aliases = ['splat'];
        this.owner = true;
        this.help = {
            message: 'Get information from SplatNet2 about current stages and Salmon Run rotations',
            usage: 'splatoon',
            inline: true
        }
    }

    async execute(message, args, chariot) {
        const options = {
            host: 'splatoon2.ink',
            path: '/data/schedules.json',
            family: 4,
            headers: {
                'User-Agent': 'Neubott/0.1 (Neu#1909, @Splatsune)'
            }
        }

        const req = http.get(options, (res) => {
            // Chariot.Logger.event(`Splatoon API status code: ${res.statusCode}`);
            // Chariot.Logger.event(`Splatoon API headers: ${JSON.stringify(res.headers)}`);
            res.setEncoding('utf8');
            let rawSchedules = '';
            res.on('data', (chunk) => {
                rawSchedules += chunk;
            });
            res.on('end',() => {
                try {
                const parsedSchedules = JSON.parse(rawSchedules);
                var timeEndBattle = new Date(parsedSchedules.regular[0].end_time);
                var timeRightNow = Math.floor(Date.now()/1000);
                var timeLeftBattle = Math.floor(Math.abs(timeEndBattle - timeRightNow) /60);
                // Chariot.Logger.event("Current Turf War Stages: " + parsedSchedules.regular[0].stage_a.name + " & " + parsedSchedules.regular[0].stage_b.name);
                // Chariot.Logger.event("Current Ranked " + parsedSchedules.gachi[0].rule.name + " Stages: " + parsedSchedules.gachi[0].stage_a.name + " & " + parsedSchedules.gachi[0].stage_b.name);
                // Chariot.Logger.event("Current League " + parsedSchedules.league[0].rule.name + " Stages: " + parsedSchedules.league[0].stage_a.name + " & " + parsedSchedules.league[0].stage_b.name);
                // Chariot.Logger.event("This rotation will change in: " + timeLeftBattle + " minutes");

                message.channel.createEmbed(new Chariot.RichEmbed()
                    .setColor('ORANGE')
                    .setTitle('Splatoon 2: Current Stages')
                    .setDescription('This schedule is valid for the next ' + timeLeftBattle + ' minutes')
                    .addField('Turf War', parsedSchedules.regular[0].stage_a.name + '\n' + parsedSchedules.regular[0].stage_b.name, true)
                    .addField('Ranked (' + parsedSchedules.gachi[0].rule.name + ')', parsedSchedules.gachi[0].stage_a.name + '\n' + parsedSchedules.gachi[0].stage_b.name,true)
                    .addField('League (' + parsedSchedules.league[0].rule.name + ')', parsedSchedules.league[0].stage_a.name + '\n' + parsedSchedules.league[0].stage_b.name,true)
                    .setUrl('https://splatoon2.ink/')
                    .setFooter('Data provided by Splatoon2.ink','https://splatoon2.ink/favicon-32x32.png')
                    );
            } catch (e) { message.channel.createMessage("❌ Problem with request: `" + e.message + "`"); }
            });
        });

        req.on('error', (e) => {
            message.channel.createMessage("❌ Problem with request: `" + e.message + "`");
          });

        req.end();
    }
}

module.exports = new Splatoon;