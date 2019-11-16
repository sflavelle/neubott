const Chariot = require('chariot.js');

class IdleSystem extends Chariot.Event {
    /**
     * Instantiating the superclass with the appropriate event name
     */
    constructor() {
        super('messageCreate');
    }
    

    async execute(message, chariot) {
        // List of array files
        let choices = [];
        choices[0] = 'facts.json';
        choices[1] = 'splat.json';

        // Special conditions for certain channels
        if (message.channel.id === 538503736423612426) // #splatoon
        { let TheChoice = JSON.parse(FS.readFileSync('./resources/' + choices[1], 'utf8')); } // Always use the squids file
        else 
        { let TheChoice = JSON.parse(FS.readFileSync('./resources/' + choices[Math.floor(Math.random()*choices.length)], 'utf8')); }

        idlemsg = TheChoice[Math.floor(Math.random()*TheChoice.length)];
        switch (message.channel.id) {
            case 206734382990360576: // #meep
            case 383151258065698816: // #bott-playground
            case 538503736423612426: // #splatoon
            default:
        }
        message.channel.createMessage()
        
    }
}

// module.exports = new IdleSystem(); // Don't let this run for now