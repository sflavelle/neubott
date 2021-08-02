const humanizeDuration = require("humanize-duration");

module.exports = {
    execute(client) {   

        let statuses = [
            { activities: [{
                type: "WATCHING",
                name: "from the ceiling"
            }]
        },
            { activities: [{
                type: "LISTENING",
                name: "water"
            }]
        },
            { activities: [{
                type: "LISTENING",
                name: "Children - Not Even Once"
            }]
        },
            { activities: [{
                type: "WATCHING",
                name: "Eevee commit arson but it's fine"
            }]
        },
            { activities: [{
                type: "WATCHING",
                name: "it fall over"
            }]
        },
            { activities: [{
                type: "WATCHING",
                name: "something comforting"
            }]
        },
            { activities: [{
                type: "PLAYING",
                name: "games with my heart"
            }]
        }]

        let statusTimer = setInterval(() => {
            let newStatus = statuses[Math.floor(Math.random()*statuses.length)];
            client.user.setPresence(newStatus);
            console.log(`Updated status: '${newStatus.activities[0].type} ${newStatus.activities[0].name}'`)
        }, 1000*60*5, client);
    }
}