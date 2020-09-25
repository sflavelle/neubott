const schedule = require('node-schedule');
const moment = require('moment');

// "2015-12-11T01:16:18.664Z"
let creationRule = new schedule.RecurrenceRule();
creationRule.month = 11;
creationRule.date = 11;
creationRule.hour = 01;
creationRule.minute = 16;

module.exports = {
    async execute(client) {
        client = client;
        schedule.scheduleJob(creationRule, (client) => {
            console.log(`Happy Birthday, General Chat!`);
            const general = client.channels.cache.get('124680630075260928');
            general.send(`**${general.guild.name} is another year older!** This server was created ${moment(creationDate, "YYYY-MM-DD").fromNow()} on ${moment(creationDate).format("MMMM Do, YYYY")}!`)
    
        })
    }
}
