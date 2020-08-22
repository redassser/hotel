exports.run = (client,message,array) => {
    const Discord = require("discord.js");  
    let hotelembed = new Discord.MessageEmbed();let helpembed = new Discord.MessageEmbed()
    if(array[0]==="setup") { //command .hotel setup
      if(!message.member.permissions.has("MANAGE_GUILD")) {message.channel.send("Only someone with server management permissions can create the hotel.");return;}
      if (message.guild.channels.cache.find(h=>h.type==="category"&&h.name==="Hotel")) {message.channel.send("You already have a hotel!");return;}
      message.guild.channels.create("Hotel", {
        type: "category",
      }).then(hotel=> {
        message.guild.channels.create("reception", {
          type: "text",
          topic: "The hotel houses secluded rooms for users and enables them to talk or do other things in privacy!",
          parent: hotel,
          nsfw: true
        }).then(reception => {
          hotelembed
            .setColor("#00cfc4")
            .setTitle("Welcome to the Hotel!")
            .setDescription("Your very own private rooms for you to enjoy at your leisure.")
            .setImage("https://cdn.glitch.com/bff3bb61-f7f9-48de-9e00-f9a9b7d1b821%2FNew%20Project.png?v=1591285953611")
            .addField("``.hotel room create``","Creates a private room for your personal use. You will be informed on our various commands once you have done so. Can only be used in reception")
            .setFooter("We also offer an nsfw .r34 command, which you my find useful in your private room. Use r34 help to find out how.")
          reception.send(hotelembed).then(msg=>msg.pin());
        })
      })
      message.channel.send("The Hotel has been constructed!");return;
    }
    helpembed
        .setColor("#00cfc4")
        .setTitle("Welcome to the Hotel!")
        .setDescription("This is a list of all commands available to valued customers.")
        .addField("``.hotel setup``","Creates the Hotel! Will be the first command used.")
        .addField("``.hotel help``","Sends an informative list with all the commands available to valued customers.")
        .addField("``.hotel room create``","Creates a private room for your personal use. Can only be used in reception")
        .addField("``.hotel room delete``","Deletes your hotel room. Can only be used within your hotel room")
        .addField("``.hotel room leave``","Leave a hotel room that you have been invited to.")
        .addField("``.hotel room topic [anything you want! Cannot include :]``","Change part of the description of your hotel room. Can only be used within your hotel room")
        .addField("``.hotel room name [anything you want!]``","Change the name of your hotel room. Can only be used within your hotel room. Can only be used within your hotel room")
        .addField("``.hotel room blacklist [tag]``","Adds the tag to the room's blacklist, or removes it from the room's blacklist. Used for a certain feature")
        .addField("``.hotel people add [username or nickname]``","Invites a person to see your hotel room. They have 60 seconds to accept the invitation in their DMs. Can only be used within your hotel room")
        .addField("``.hotel people remove [user ping]``","Removes a person from your hotel room. Can only be used within your hotel room")
        .setThumbnail("https://rule34.xxx/images/topb.png")
        .setFooter("We also offer an nsfw .r34 command, which you my find useful in your private room.\n Use .r34 help to find out how.");
    if (array[0]==="help") {
      message.channel.send(helpembed);return;
    }
    if(message.channel.parent.name != "Hotel") {message.channel.send("Hotel commands only work in the hotel!");return;} 
    var chan = message.channel.name; var userid = message.author.id; 
    var hotel = message.guild.channels.cache.find(h=>h.type==="category"&&h.name==="Hotel")
    var subject = array.shift(); var exec = array.shift();
    const filter = (mess) => {
          return mess.content.toLowerCase()==="yes" && mess.author.id === message.author.id
        };
    switch(subject) { //switch .hotel
      case "room":
        var blacklist = ["Blacklist=> "].join("; ")
        switch(exec) { //switch .hotel room
          case "create": //command .hotel room create
            if(chan!="reception") {console.log(chan);message.channel.send("Sorry, but this command may only work in reception.");return;}
            var roomcount=0;
            message.channel.parent.children.each(chan=> {
              if(chan.type="text"&&chan.topic.split(":")[1]===userid){roomcount++}
            })
            if (roomcount>1) {message.channel.send("You have reached our maxmimum of two rooms, please use those.");return;}
            message.guild.channels.create("room "+message.author.username, {
              type: "text",
              topic: "ID:"+userid+":Do not change this: "+blacklist+": -- :Your own private hotel room!",
              parent: hotel,
              nsfw:true,
              permissionOverwrites:  [
                {
                  id: userid,
                  allow: ["VIEW_CHANNEL","SEND_MESSAGES","MANAGE_MESSAGES"] //User needs to see the channel, and manage any messages at their will
                },
                {
                  id: client.user.id,
                  allow: ["VIEW_CHANNEL","SEND_MESSAGES","MANAGE_MESSAGES","EMBED_LINKS","ADD_REACTIONS","MANAGE_CHANNELS"] //Bot needs to see the channel, and delete it or edit it at it's will
                },
                {
                  id: message.guild.id,
                  deny: ["VIEW_CHANNEL"] //Everyone else must not see the channel
                }
              ]
            }).then(channle =>{
              channle.send(helpembed);
              channle.send("Welcome to your room, "+message.author.toString()); return;
            })
            break;
          case "blacklist":
            blacklist = message.channel.topic.split(":")[3].split("; ")
            blacklist.shift()
            var tag = array.shift()
            var desc = message.channel.topic.split(":")
            if(blacklist.includes(tag)) {blacklist.splice(blacklist.indexOf(tag),1);message.channel.send(tag+" has been removed from the blacklist.")} 
            else {blacklist.push(tag);message.channel.send(tag+" has been added to the blacklist.")}
            blacklist.unshift("Blacklist=> ")
            desc[3] = blacklist.join("; ")
            message.channel.edit({topic:desc.join(":")})
            break;
          case "leave":
            if(message.channel.topic.split(":")[1] === userid) {message.channel.send("You can't leave your own hotel room!");return;}
            message.channel.send("You are about to leave this room, is that okay?\nRespond with \"yes\" if so.").then(msg=>{
              msg.channel.awaitMessages(filter, {max:1,time:10000,errors:["time"]})
              .then(collected=>{
                message.channel.updateOverwrite(message.author,
                  {
                    SEND_MESSAGES:false,
                    VIEW_CHANNEL:false //Invitee needs to see and interact with channel
                  }
                )
                  message.channel.send(message.author.username+" has left from the room!")
              })
              .catch(() => {message.channel.send('``No \"yes\" response after 10 seconds, removal postponed.``').then(msg => {msg.delete({timeout: 5000})});});
            })
            break;
          case "delete": //command .hotel room delete
            if(message.channel.topic.split(":")[1] != userid) {message.channel.send("Sorry, but this command only works in your own hotel room.");return;}
            message.channel.send("Are you absolutely sure you want to permanently delete this hotel room?\nRespond with \"yes\" if so.").then(msg=>{
              msg.channel.awaitMessages(filter, {max:1,time:10000,errors:["time"]})
              .then(collected=>{
                if(collected === "yes") {message.channel.send("Thank you for your patronage, goodbye!")}
                message.channel.delete("Requested by the room owner");
              })
              .catch(() => {message.channel.send('``No \"yes\" response after 10 seconds, deletion postponed.``').then(msg => {msg.delete({timeout: 5000})});});
            })
            break;
          case "topic": //command .hotel room topic
            if(message.channel.topic.split(":")[1] != userid) {message.channel.send("Sorry, but this command only works in your own hotel room.");return;}
            var newdesc = array.join(" ")
            var desc = message.channel.topic.split(":")
            if (newdesc.indexOf(":")!=-1) {message.channel.send("Sorry for the inconveniece, but please do not include colons : in your topic. Thank you for understanding.");return;}
            desc[5] = newdesc
            message.channel.edit({topic:desc.join(":")})
            break;
          case "name": //command .hotel room name
            if(message.channel.topic.split(":")[1] != userid) {message.channel.send("Sorry, but this command only works in your own hotel room.");return;}
            if (array.length===0) {message.channel.send("Please suggest a name.");return;}
            message.channel.edit({name:array.join(" ")})
            break;
          default: //command .hotel room    
            break;
        }
        break;
      case "people":
        if(message.channel.topic.split(":")[1] != userid) {message.channel.send("Sorry, but this command only works in your own hotel room.");return;}
        const dmfilter = (mess) => {
             return mess.content.toLowerCase()==="accept"
            };
        switch(exec) { //switch .hotel people
          case "add": //command .hotel people add  
            var username = array.shift()
              message.guild.members.fetch({query:username,limit:1})
              .then(pers=>{
                if (pers.first()===undefined) {message.channel.send("Sorry, we couldn't find the person you were looking, please try again.");return;}
                if (message.channel.members.array().includes(pers.first())) {message.channel.send("It would seem that they are already here!");return}
                message.channel.send("You are about to invite "+pers.first().toString()+", is that okay?\nRespond with \"yes\" if so.").then(msg=>{
              msg.channel.awaitMessages(filter, {max:1,time:10000,errors:["time"]})
              .then(collected=>{
                pers.first().user.createDM().then(dm=>{
                  dm.send("You have been invited to join "+message.author.username+"\'s room in "+message.guild.name+"\nPlease reply \"accept\" to enter the room.")
                  dm.awaitMessages(dmfilter, {max:1,time:60000,errors:["time"]})
                  .then(collected=>{
                    message.channel.createOverwrite(pers.first(),
                    {
                      SEND_MESSAGES:true,
                      VIEW_CHANNEL:true //Invitee needs to see and interact with channel
                    }
                  )
                  message.channel.send(pers.first().toString()+" has been invited to the room!");return;
              })
              .catch(() => {message.channel.send('``No \"accept\" response after 60 seconds, invitation postponed.``').then(msg => {msg.delete({timeout: 5000})});});
                })
              })
              .catch(() => {message.channel.send('``No \"yes\" response after 10 seconds, invitation postponed.``').then(msg => {msg.delete({timeout: 5000})});});
            })
              })
            break;
          case "remove": //command .hotel people remove
            var ping = message.mentions.members.first()
            if (ping===undefined) {message.channel.send("Please ping a user who has access to this room.");return;}
            if (ping.id === client.user.id || ping.id === message.author.id) {message.channel.send("Please ping a room guest...");return;}
            message.channel.send("You are about to invite "+ping.toString()+", is that okay?\nRespond with \"yes\" if so.").then(msg=>{
              msg.channel.awaitMessages(filter, {max:1,time:10000,errors:["time"]})
              .then(collected=>{
                message.channel.updateOverwrite(ping,
                  {
                    SEND_MESSAGES:false,
                    VIEW_CHANNEL:false //Invitee needs to see and interact with channel
                  }
                )
                  message.channel.send(ping.toString()+" has been removed from your room!")
              })
              .catch(() => {message.channel.send('``No \"yes\" response after 10 seconds, removal postponed.``').then(msg => {msg.delete({timeout: 5000})});});
            })
          default: //command .hotel people
            break;
        }
        break;
      default: //command .hotel
        break;
    }
  }