const Chariot = require('chariot.js');
const FS = require("fs");

class IdleSystem extends Chariot.Event {
    /**
     * Instantiating the superclass with the appropriate event name
     */
    constructor() {
        super('messageCreate');
    }
    
    async execute(message) {

        function IdleContent(message) {
            message.channel.createMessage("Test");
            Chariot.Logger.event(`[Idle] executed idle routine in ${message.channel.name}`);
        }

        switch (message.channel.id) {
            case "206734382990360576": // #meep
            case "383151258065698816": // #bott-playground
                Chariot.Logger.event(`[Idle] new message in ${message.channel.name}`);
                let shortTimer = setTimeout(IdleContent, 1000*60, message);
                break;
            case "538503736423612426": // #splatoon
            default:
                break;
        }
        
    }
}

//module.exports = new IdleSystem(); // Don't let this run for now