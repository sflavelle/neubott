const schedule = require('node-schedule');
const moment = require('moment');

// "2015-12-11T01:16:18.664Z"
let creationRule = new schedule.RecurrenceRule();
creationRule.month = 08;
creationRule.date = 21;
creationRule.hour = 6;
creationRule.minute = 0;

const september = [
    "https://www.youtube.com/watch?v=Gs069dndIYk",
    "https://www.youtube.com/watch?v=w_TxAtoahLs",
    "https://www.youtube.com/watch?v=_hpU6UEq8hA",
    "https://www.youtube.com/watch?v=jbRictYE2QU",
    "https://www.youtube.com/watch?v=_zzEDrYTkkg",
    "https://www.youtube.com/watch?v=CG7YHFT4hjw",
    "https://www.youtube.com/watch?v=fPpUYXZb2AA",
    "https://www.youtube.com/watch?v=kPwG6L73-VU"
]

module.exports = {
    execute(client) {
        client = client;
        schedule.scheduleJob(creationRule, (client) => {
            console.log(`Hey - it's the 21st night of September!`);
            const channels = ['124680630075260928', '206734382990360576']
            let chan;

            for (chan of channels) {
                let general = client.channels.cache.get(chan);
                general.send(`Hmm... I think I'm supposed to remember something on this day...`)
                    .then((msg) => {
                        sleep(1000*60*2);
                        general.send(`Oh, I remember! ${september[Math.floor(Math.random()*statuses.length)]}`)
                    })
            }
        })
    }
}
