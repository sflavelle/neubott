const Discord = require('discord.js');
const FS = require("fs");
const axios = require("axios");
const humanizeDuration = require("humanize-duration");

module.exports = {
    name: 'splatoon',
    shortDesc: `Here are the battle stages today!`,
    async execute(message, args) {

        let TSbegin = Date.now();

        let options = {
            baseURL: 'https://splatoon2.ink/',
            headers: {
                'User-Agent': 'Neubott/0.1 (Splatsune#1909, @Splatsune)'
            }
        }

        // Let's try to make a cache here
        let dataBattle = ( FS.existsSync('./resources/.cache/spl2-battle.json') ) ? FS.readFileSync('./resources/.cache/spl2-battle.json', 'utf8') : new Object();
        dataBattle = JSON.parse(dataBattle);
        // If it doesn't exist, pull the data and save it
        if (dataBattle.length === 0 || dataBattle.regular[0].end_time < Date.now()/1000) {
            const reqBattle = await axios.get('/data/schedules.json', options);
            dataBattle = reqBattle.data;
            FS.writeFileSync('./resources/.cache/spl2-battle.json', JSON.stringify(dataBattle, null, 2));
        };

        var timeEndBattle = new Date(dataBattle.regular[0].end_time);
        var timeRightNow = Math.floor(Date.now()/1000);
        var timeLeftBattle = Math.floor(Math.abs(timeEndBattle - timeRightNow))*1000;
        var timeLeftBattleFormatted = ''
        // switch (Math.floor(timeLeftBattle/1000/60/60)) {
        //     case 0:
        //         timeLeftBattleFormatted = humanizeDuration(timeLeftBattle);
        //         break;
        //     case 1:
        //     default: // just in case
        //         timeLeftBattleFormatted = humanizeDuration(timeLeftBattle, { units: ['h', 'm'] });
        // }
        let TSend = Date.now();

        const TurfEmbed = new Discord.MessageEmbed()
            .setColor('ORANGE')
            .setTitle('Splatoon 2: Current Stages')
            .setDescription(`This schedule is valid for the next **${humanizeDuration(timeLeftBattle, { largest: 2 })}**`)
            .setImage('https://splatoon2.ink/assets/splatnet' + dataBattle.regular[0].stage_a.image)
            .addField('Turf War', dataBattle.regular[0].stage_a.name + '\n' + dataBattle.regular[0].stage_b.name, true)
            .addField('Ranked (' + dataBattle.gachi[0].rule.name + ')', dataBattle.gachi[0].stage_a.name + '\n' + dataBattle.gachi[0].stage_b.name,true)
            .addField('League (' + dataBattle.league[0].rule.name + ')', dataBattle.league[0].stage_a.name + '\n' + dataBattle.league[0].stage_b.name,true)
            .setURL('https://splatoon2.ink/')
            .setTimestamp()
            .setFooter('Data provided by Splatoon2.ink, processed in ' + (TSend - TSbegin) + 'ms','https://splatoon2.ink/favicon-32x32.png')

        message.channel.send(null, { embed: TurfEmbed })
     
        // Now for the Salmon Run data
        TSbegin = Date.now();
        let dataSR = ( FS.existsSync('./resources/.cache/spl2-salmonrun.json') ) ? JSON.parse(FS.readFileSync('./resources/.cache/spl2-salmonrun.json', 'utf8')) : [];

        if (dataSR.length === 0 || !(dataSR.details && dataSR.details[0].end_time < Date.now()/1000)) {
            const reqSR = await axios.get('/data/coop-schedules.json', options);
            const reqSRG = await axios.get('/data/timeline.json', options);
            dataSR = [].concat(reqSR.data, reqSRG.data);
            FS.writeFileSync('./resources/.cache/spl2-salmonrun.json', JSON.stringify(dataSR, null, 2));
            }
        var timeEndSR = new Date(dataSR[0].details[0].end_time);
        let SRstage = dataSR[0].details[0].stage;
        let SRw1 = dataSR[0].details[0].weapons[0].id > -1 ? dataSR[0].details[0].weapons[0].weapon.name : `*${dataSR[0].details[0].weapons[0].coop_special_weapon.name}*`;
        let SRw2 = dataSR[0].details[0].weapons[1].id > -1 ? dataSR[0].details[0].weapons[1].weapon.name : `*${dataSR[0].details[0].weapons[1].coop_special_weapon.name}*`;
        let SRw3 = dataSR[0].details[0].weapons[2].id > -1 ? dataSR[0].details[0].weapons[2].weapon.name : `*${dataSR[0].details[0].weapons[2].coop_special_weapon.name}*`;
        let SRw4 = dataSR[0].details[0].weapons[3].id > -1 ? dataSR[0].details[0].weapons[3].weapon.name : `*${dataSR[0].details[0].weapons[3].coop_special_weapon.name}*`;
        let SRreward = `${dataSR[1].coop.reward_gear.gear.name}`

        var timeRightNow = Math.floor(Date.now()/1000);
        var timeLeftSR = Math.floor(Math.abs(timeEndSR - timeRightNow))*1000;
        var timeLeftSRFormatted = '';
        // switch (Math.floor(timeLeftSR/1000/60/60)) {
        //     case 0:
        //         timeLeftSRFormatted = humanizeDuration(timeLeftSR, { units: ['m', 's'] });
        //         break;
        //     case 1:
        //     case 2:
        //     case 3:
        //         timeLeftSRFormatted = humanizeDuration(timeLeftSR, { units: ['h', 'm'] });
        //         break;
        //     default: 
        //         timeLeftSRFormatted = humanizeDuration(timeLeftSR, { units: ['d', 'h'] });;
        // }
        TSend = Date.now();
        if (timeRightNow < dataSR[0].details[0].start_time) {
            const SREmbed = new Discord.MessageEmbed()
                .setColor('DARK_GREEN')
                .setTitle(`Grizzco will open in **${humanizeDuration(Math.abs((dataSR[0].details[0].start_time - timeRightNow)*1000), { largest: 2 })}**.`)
                // .setDescription(`The next available reward will be a ${SRreward}.`)
                .setFooter('Processed in ' + (TSend - TSbegin) + 'ms')

            message.channel.send(null, { embed: SREmbed })
            return; //Only continue further processing if there's a shift running
        } else {
            const SREmbed = new Discord.MessageEmbed()
                .setColor('DARK_GREEN')
                .setTitle('Splatoon 2: Salmon Run Shift')
                .setDescription(`This schedule is valid for the next **${humanizeDuration(timeLeftSR, { largest: 2 })}**`)
                .setImage('https://splatoon2.ink/assets/splatnet' + SRstage.image)
                .addField('Stage', SRstage.name, true)
                .addField('Reward', SRreward, true)
                .addField('Weapons', `${SRw1}\n${SRw2}\n${SRw3}\n${SRw4}`, true)
                .setURL('https://splatoon2.ink/')
                .setTimestamp()
                .setFooter('Data provided by Splatoon2.ink, processed in ' + (TSend - TSbegin) + 'ms','https://splatoon2.ink/favicon-32x32.png')
            
            message.channel.send(null, { embed: SREmbed });
        }
    }
}