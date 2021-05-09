module.exports = {
    name: 'remember',
    help: {
        short: `shortcut to remember a quote`,
        visible: false,
    },
    execute(message,args) {
        message.client.commands.get('quote').remember(message, args);
    }
}