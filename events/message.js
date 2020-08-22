module.exports = (client, message) => {
    //bot return
      if (message.author.bot) return;
      const Discord = require("discord.js")
      
    //command fondling
      if (message.content.indexOf(".") !== 0) return;
      const array = message.content.slice(1).trim().split(/ +/g);
      const command = array.shift().toLowerCase();
    
      const cmd = client.commands.get(command);
      if (!cmd) return;
    
      cmd.run(client, message, array);
    };