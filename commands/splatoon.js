const Chariot = require('chariot.js');
const FS = require("fs");
const axios = require("axios");

class Splatoon extends Chariot.Command {
    constructor() {
        super();

        this.name = 'splatoon';
        this.cooldown = 60;
        this.aliases = ['splat'];
        this.help = {
            message: 'Get information from SplatNet2 about current stages and Salmon Run rotations',
            usage: 'splatoon',
            inline: true
        }
    }

    async execute(message, args, chariot) {

        let TSbegin = Date.now();

        let options = {
            baseURL: 'https://splatoon2.ink/',
            headers: {
                'User-Agent': 'Neubott/0.1 (Neu#1909, @Splatsune)'
            }
        }

        // Let's try to make a cache here
        const cacheBattle = ( FS.existsSync('./resources/.cache/spl2-battle.json') ) ? JSON.parse(FS.readFileSync('./resources/.cache/spl2-battle.json', 'utf8')) : null;
        if (cacheBattle == null || cacheBattle.regular[0].end_time < Date.now()/1000) {

        const reqBattle = await axios.get('/data/schedules.json', options);
        const dataBattle = reqBattle.data;

        FS.writeFileSync('./resources/.cache/spl2-battle.json', JSON.stringify(dataBattle, null, 2));
        var timeEndBattle = new Date(dataBattle.regular[0].end_time);
        var timeRightNow = Math.floor(Date.now()/1000);
        var timeLeftBattle = Math.floor(Math.abs(timeEndBattle - timeRightNow));
        var timeLeftBattleFormatted = ''
        switch (Math.floor(timeLeftBattle/60/60)) {
            case 0:
                timeLeftBattleFormatted = `${Math.floor(timeLeftBattle/60%60)} minutes`;
                break;
            case 1:
            default: // just in case
                timeLeftBattleFormatted = `${Math.floor(timeLeftBattle/60/60)} hour ${Math.floor(timeLeftBattle/60%60)} minutes`;
        }
        let TSend = Date.now();

        message.channel.createEmbed(new Chariot.RichEmbed()
            .setColor('ORANGE')
            .setTitle('Splatoon 2: Current Stages')
            .setDescription('This schedule is valid for the next **' + timeLeftBattleFormatted + '**')
            .setImage('https://splatoon2.ink/assets/splatnet' + dataBattle.regular[0].stage_a.image)
            .addField('Turf War', dataBattle.regular[0].stage_a.name + '\n' + dataBattle.regular[0].stage_b.name, true)
            .addField('Ranked (' + dataBattle.gachi[0].rule.name + ')', dataBattle.gachi[0].stage_a.name + '\n' + dataBattle.gachi[0].stage_b.name,true)
            .addField('League (' + dataBattle.league[0].rule.name + ')', dataBattle.league[0].stage_a.name + '\n' + dataBattle.league[0].stage_b.name,true)
            .setUrl('https://splatoon2.ink/')
            .setTimestamp()
            .setFooter('Data provided by Splatoon2.ink, processed in ' + (TSend - TSbegin) + 'ms','https://splatoon2.ink/favicon-32x32.png')
            );

        let pause = await reqBattle;
        }
        else { // Use the cached data
            var timeEndBattle = new Date(cacheBattle.regular[0].end_time);
            var timeRightNow = Math.floor(Date.now()/1000);
            var timeLeftBattle = Math.floor(Math.abs(timeEndBattle - timeRightNow));
            var timeLeftBattleFormatted = ''
            switch (Math.floor(timeLeftBattle/60/60)) {
                case 0:
                    timeLeftBattleFormatted = `${Math.floor(timeLeftBattle/60%60)} minutes`;
                    break;
                case 1:
                default: // just in case
                    timeLeftBattleFormatted = `${Math.floor(timeLeftBattle/60/60)} hour ${Math.floor(timeLeftBattle/60%60)} minutes`;
            }
            let TSend = Date.now();
            // Chariot.Logger.event("Current Turf War Stages: " + cacheBattle.regular[0].stage_a.name + " & " + cacheBattle.regular[0].stage_b.name);
            // Chariot.Logger.event("Current Ranked " + cacheBattle.gachi[0].rule.name + " Stages: " + cacheBattle.gachi[0].stage_a.name + " & " + cacheBattle.gachi[0].stage_b.name);
            // Chariot.Logger.event("Current League " + cacheBattle.league[0].rule.name + " Stages: " + cacheBattle.league[0].stage_a.name + " & " + cacheBattle.league[0].stage_b.name);
            // Chariot.Logger.event("This rotation will change in: " + timeLeftBattle + " minutes");

            message.channel.createEmbed(new Chariot.RichEmbed()
                .setColor('ORANGE')
                .setTitle('Splatoon 2: Current Stages')
                .setDescription('This schedule is valid for the next **' + timeLeftBattleFormatted + '**')
                .setImage('https://splatoon2.ink/assets/splatnet' + cacheBattle.regular[0].stage_a.image)
                .addField('Turf War', cacheBattle.regular[0].stage_a.name + '\n' + cacheBattle.regular[0].stage_b.name, true)
                .addField('Ranked (' + cacheBattle.gachi[0].rule.name + ')', cacheBattle.gachi[0].stage_a.name + '\n' + cacheBattle.gachi[0].stage_b.name,true)
                .addField('League (' + cacheBattle.league[0].rule.name + ')', cacheBattle.league[0].stage_a.name + '\n' + cacheBattle.league[0].stage_b.name,true)
                .setUrl('https://splatoon2.ink/')
                .setTimestamp()
                .setFooter('Cached data provided by Splatoon2.ink, processed in ' + (TSend - TSbegin) + 'ms','https://splatoon2.ink/favicon-32x32.png')
                );
        }
        // Now for the Salmon Run data
        TSbegin = Date.now();
        let dataSRG = [];
        let dataSR = [];
        const cacheSR = ( FS.existsSync('./resources/.cache/spl2-salmonrun.json') ) ? JSON.parse(FS.readFileSync('./resources/.cache/spl2-salmonrun.json', 'utf8')) : null;
        const cacheSRG = ( FS.existsSync('./resources/.cache/spl2-srgear.json') ) ? JSON.parse(FS.readFileSync('./resources/.cache/spl2-srgear.json', 'utf8')) : null;
        if (cacheSR == null || cacheSR.details[0].end_time < Date.now()/1000) {

            const reqSR = await axios.get('/data/coop-schedules.json', options);
            dataSR = reqSR.data;
            FS.writeFileSync('./resources/.cache/spl2-salmonrun.json', JSON.stringify(dataSR, null, 2));
            if (cacheSRG == null || cacheSR.details[0].end_time < Date.now()/1000) {
                const reqSRG = await axios.get('/data/timeline.json', options);
                dataSRG = reqSRG.data;
                FS.writeFileSync('./resources/.cache/spl2-srgear.json', JSON.stringify(dataSRG, null, 2));
            } else {dataSRG = cacheSRG;};
       
        var timeEndSR = new Date(dataSR.details[0].end_time);
        let SRstage = dataSR.details[0].stage;
        let SRw1 = dataSR.details[0].weapons[0].id > -1 ? dataSR.details[0].weapons[0].weapon.name : `*${dataSR.details[0].weapons[0].coop_special_weapon.name}*`;
        let SRw2 = dataSR.details[0].weapons[1].id > -1 ? dataSR.details[0].weapons[1].weapon.name : `*${dataSR.details[0].weapons[1].coop_special_weapon.name}*`;
        let SRw3 = dataSR.details[0].weapons[2].id > -1 ? dataSR.details[0].weapons[2].weapon.name : `*${dataSR.details[0].weapons[2].coop_special_weapon.name}*`;
        let SRw4 = dataSR.details[0].weapons[3].id > -1 ? dataSR.details[0].weapons[3].weapon.name : `*${dataSR.details[0].weapons[3].coop_special_weapon.name}*`;
        let SRreward = `${dataSRG.coop.reward_gear.gear.name}`

        var timeRightNow = Math.floor(Date.now()/1000);
        var timeLeftSR = Math.floor(Math.abs(timeEndSR - timeRightNow));
        var timeLeftSRFormatted = '';
        switch (Math.floor(timeLeftSR/60/60)) {
            case 0:
                timeLeftSRFormatted = `${Math.floor(timeLeftSR/60%60)} minutes`;
                break;
            case 1:
            case 2:
            case 3:
                timeLeftSRFormatted = `${Math.floor(timeLeftSR/60/60)} hours ${Math.floor(timeLeftSR/60%60)} minutes`
                break;
            default: 
                timeLeftSRFormatted = `${Math.floor(timeLeftSR/60/60)} hours`;
        }
        let TSend = Date.now();
        if (timeRightNow < dataSR.details[0].start_time) {
            message.channel.createEmbed(new Chariot.RichEmbed()
            .setColor('DARK_GREEN')
            .setTitle('Grizzco will open in **' + (+(Math.abs(dataSR.details[0].start_time - timeRightNow) /60/60).toFixed(1)) + '** hours.')
            .setFooter('Processed in ' + (TSend - TSbegin) + 'ms')
            );
            return; //Only continue further processing if there's a shift running
        } else {
            message.channel.createEmbed(new Chariot.RichEmbed()
            .setColor('DARK_GREEN')
            .setTitle('Splatoon 2: Salmon Run Shift')
            .setDescription('This schedule is valid for the next **' + timeLeftSRFormatted + '**')
            .setImage('https://splatoon2.ink/assets/splatnet' + SRstage.image)
            .addField('Stage', SRstage.name, true)
            .addField('Reward', SRreward, true)
            .addField('Weapons', `${SRw1}\n${SRw2}\n${SRw3}\n${SRw4}`, true)
            .setUrl('https://splatoon2.ink/')
            .setTimestamp()
            .setFooter('Data provided by Splatoon2.ink, processed in ' + (TSend - TSbegin) + 'ms','https://splatoon2.ink/favicon-32x32.png')
            );}

        } else { // Use the cached data
        if (cacheSRG == null || cacheSR.details[0].end_time < Date.now()/1000) {
            const reqSRG = await axios.get('/data/timeline.json', options);
            dataSRG = reqSRG.data;
            FS.writeFileSync('./resources/.cache/spl2-srgear.json', JSON.stringify(dataSRG, null, 2));
            } else {dataSRG = cacheSRG;};
        var timeEndSR = new Date(cacheSR.details[0].end_time);
        let SRstage = cacheSR.details[0].stage;
        let SRw1 = cacheSR.details[0].weapons[0].id > -1 ? cacheSR.details[0].weapons[0].weapon.name : `*${cacheSR.details[0].weapons[0].coop_special_weapon.name}*`;
        let SRw2 = cacheSR.details[0].weapons[1].id > -1 ? cacheSR.details[0].weapons[1].weapon.name : `*${cacheSR.details[0].weapons[1].coop_special_weapon.name}*`;
        let SRw3 = cacheSR.details[0].weapons[2].id > -1 ? cacheSR.details[0].weapons[2].weapon.name : `*${cacheSR.details[0].weapons[2].coop_special_weapon.name}*`;
        let SRw4 = cacheSR.details[0].weapons[3].id > -1 ? cacheSR.details[0].weapons[3].weapon.name : `*${cacheSR.details[0].weapons[3].coop_special_weapon.name}*`;
        let SRreward = `${dataSRG.coop.reward_gear.gear.name}`
        
        var timeRightNow = Math.floor(Date.now()/1000);
        var timeLeftSR = Math.floor(Math.abs(timeEndSR - timeRightNow));
        var timeLeftSRFormatted = '';
        switch (Math.floor(timeLeftSR/60/60)) {
            case 0:
                    timeLeftSRFormatted = `${Math.floor(timeLeftSR/60%60)} minutes`;
                break;
            case 1:
            case 2:
            case 3:
                timeLeftSRFormatted = `${Math.floor(timeLeftSR/60/60)} hours ${Math.floor(timeLeftSR/60%60)} minutes`
                break;
            default: 
                timeLeftSRFormatted = `${Math.floor(timeLeftSR/60/60)} hours`;
        }
        let TSend = Date.now();
        if (timeRightNow < cacheSR.details[0].start_time) {
            message.channel.createEmbed(new Chariot.RichEmbed()
            .setColor('DARK_GREEN')
            .setTitle('Grizzco will open in **' + (+(Math.abs(cacheSR.details[0].start_time - timeRightNow) /60/60).toFixed(1)) + '** hours.')
            .setFooter('Processed in ' + (TSend - TSbegin) + 'ms')
            );
        } else {
            message.channel.createEmbed(new Chariot.RichEmbed()
            .setColor('DARK_GREEN')
            .setTitle('Splatoon 2: Salmon Run Shift')
            .setDescription('This schedule is valid for the next **' + timeLeftSRFormatted + '**')
            .setImage('https://splatoon2.ink/assets/splatnet' + SRstage.image)
            .addField('Stage', SRstage.name, true)
            .addField('Reward', SRreward, true)
            .addField('Weapons', `${SRw1}\n${SRw2}\n${SRw3}\n${SRw4}`, true)
            .setUrl('https://splatoon2.ink/')
            .setTimestamp()
            .setFooter('Cached data provided by Splatoon2.ink, processed in ' + (TSend - TSbegin) + 'ms','https://splatoon2.ink/favicon-32x32.png')
            );
        }; //Only continue further processing if there's a shift running
        };

    }
}

module.exports = new Splatoon;