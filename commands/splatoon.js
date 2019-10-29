const Chariot = require('chariot.js');
const FS = require("fs");
const http = require('https');
const fetch = require("node-fetch");

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
                    .setDescription('This schedule is valid for the next **' + timeLeftBattle + '** minutes')
                    .addField('Turf War', parsedSchedules.regular[0].stage_a.name + '\n' + parsedSchedules.regular[0].stage_b.name, true)
                    .addField('Ranked (' + parsedSchedules.gachi[0].rule.name + ')', parsedSchedules.gachi[0].stage_a.name + '\n' + parsedSchedules.gachi[0].stage_b.name,true)
                    .addField('League (' + parsedSchedules.league[0].rule.name + ')', parsedSchedules.league[0].stage_a.name + '\n' + parsedSchedules.league[0].stage_b.name,true)
                    .setUrl('https://splatoon2.ink/')
                    .setTimestamp()
                    .setFooter('Data provided by Splatoon2.ink','https://splatoon2.ink/favicon-32x32.png')
                    );
            } catch (e) { message.channel.createMessage("❌ Problem with request: `" + e.message + "`"); }
            });
        });

        req.on('error', (e) => {
            message.channel.createMessage("❌ Problem with request: `" + e.message + "`");
          });

        req.end();

        // Now for the Salmon Run data
        let pause = await req;
        options.path = '/data/coop-schedules.json';

        const req2 = http.get(options, (res) => {
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
                var timeEndSR = new Date(parsedSchedules.details[0].end_time);
                var timeRightNow = Math.floor(Date.now()/1000);
                var timeLeftSR = Math.floor(Math.abs(timeEndSR - timeRightNow) /60/60);
                // Chariot.Logger.event("Current Turf War Stages: " + parsedSchedules.regular[0].stage_a.name + " & " + parsedSchedules.regular[0].stage_b.name);
                // Chariot.Logger.event("Current Ranked " + parsedSchedules.gachi[0].rule.name + " Stages: " + parsedSchedules.gachi[0].stage_a.name + " & " + parsedSchedules.gachi[0].stage_b.name);
                // Chariot.Logger.event("Current League " + parsedSchedules.league[0].rule.name + " Stages: " + parsedSchedules.league[0].stage_a.name + " & " + parsedSchedules.league[0].stage_b.name);
                // Chariot.Logger.event("This rotation will change in: " + timeLeftBattle + " minutes");
                if (timeRightNow < parsedSchedules.details[0].start_time) {
                    message.channel.createEmbed(new Chariot.RichEmbed()
                    .setColor('DARK_GREEN')
                    .setTitle('Grizzco will open in **' + (Math.floor(Math.abs(parsedSchedules.details[0].start_time - timeRightNow) /60/60)) + '** hours.')
                    );
                    return; //Only continue further processing if there's a shift running
                }

                let srGear = fetch('https://splatoon2.ink/data/timeline.json')
                // if (srGear.ok) {
                //     let srGearJson = srGear.json();
                //     const srGearName = srGearJson.coop.reward_gear.gear.name;
                //
                // TODO: Reward Code

                    message.channel.createEmbed(new Chariot.RichEmbed()
                    .setColor('DARK_GREEN')
                    .setTitle('Splatoon 2: Salmon Run Shift')
                    .setDescription('This schedule is valid for the next **' + Math.floor(timeLeftSR) + '** hours')
                    .setImage('https://splatoon2.ink/assets/splatnet' + parsedSchedules.details[0].stage.image)
                    .addField('Stage', parsedSchedules.details[0].stage.name, true)
                    .addField('Weapons', parsedSchedules.details[0].weapons[0].weapon.name + "\n" + parsedSchedules.details[0].weapons[1].weapon.name + "\n" + parsedSchedules.details[0].weapons[2].weapon.name + "\n" + parsedSchedules.details[0].weapons[3].weapon.name, true)
                    .addField('Reward', 'Coming soon!', true)
                    .setUrl('https://splatoon2.ink/')
                    .setTimestamp()
                    .setFooter('Data provided by Splatoon2.ink','https://splatoon2.ink/favicon-32x32.png')
                    );

            } catch (e) { message.channel.createMessage("❌ Problem with SR request: `" + e.message + "`"); }
            });
        });

        req2.on('error', (e) => {
            message.channel.createMessage("❌ Problem with SR request: `" + e.message + "`");
          });

        req2.end();
        
    }
}

module.exports = new Splatoon;