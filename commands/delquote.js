module.exports = {
    name: 'delquote',
    help: {
        short: `shortcut to delete a quote`,
        visible: false,
    },
    execute(message,args) {
        args.push('?delete');
        message.client.commands.get('quote').execute(message, args);
    }
}