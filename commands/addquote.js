module.exports = {
    name: 'addquote',
    help: {
        short: `shortcut to add a quote`,
        visible: false,
    },
    execute(message,args) {
        message.client.commands.get('quote').add(message, args);
    }
}