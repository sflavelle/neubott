const humanizeDuration = require("humanize-duration");

module.exports = {
    name: 'uptime',
    help: {
      visible: true,
      short: 'How long have I been running?',
      usage: [ 'uptime' ],
    },
    execute(message, args) {
      message.channel.send(`This process has been running for ${humanizeDuration(process.uptime()*1000, { round: true, maxDecimalPoints:1 })}`);
    },
    idle(message, args) {
      message.channel.send(`I've been running for **${humanizeDuration(process.uptime()*1000, { round: true, maxDecimalPoints:1 })}** so far!`);
    }

}