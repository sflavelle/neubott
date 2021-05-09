const humanizeDuration = require("humanize-duration");

module.exports = {
    execute(client) {   

        let statuses = [
            { activity: {
                type: "WATCHING",
                name: "from the ceiling"
            }},
            { activity: {
                type: "LISTENING",
                name: "water"
            }},
            { activity: {
                type: "LISTENING",
                name: "Children - Not Even Once"
            }},
            { activity: {
                type: "WATCHING",
                name: "Eevee commit arson but it's fine"
            }},
            { activity: {
                type: "WATCHING",
                name: "it fall over"
            }},
            { activity: {
                type: "WATCHING",
                name: "something comforting"
            }},
            { activity: {
                type: "PLAYING",
                name: "games with my heart"
            }}
        ]

        let statusTimer = setInterval(() => {
            let newStatus = statuses[Math.floor(Math.random()*statuses.length)];
            client.user.setPresence(newStatus);
            console.log(`Updated status: '${newStatus.activity.type} ${newStatus.activity.name}'`)
        }, 1000*60*5, client);
    }
}