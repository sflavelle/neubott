module.exports = {
    name: 'uptime',
    shortDesc: 'How long have I been running?',
    execute(message, args) {
        
        function formatTime(seconds){
            function pad(s){
                    return (s < 10 ? '0' : '') + s;
                  }
            var hours = Math.floor(seconds / (60*60));
            var minutes = Math.floor(seconds % (60*60) / 60);
            var seconds = Math.floor(seconds % 60);
      
            return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
      }

      message.channel.send(`Currently up for ${formatTime(process.uptime())}`);

    }
}