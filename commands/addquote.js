module.exports = {
    name: 'addquote',
    shortDesc: `shortcut to add a quote`,
    helpVisible: false,
    execute(message,args) {
        message.client.commands.get('quote').add(message, args);
    }
}