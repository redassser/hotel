exports.run = (client,message,array) => {
    if (!message.channel.nsfw) {message.channel.send("This doesn't look like an nsfw channel"); return;}
    const Booru = require("booru");
    const Discord = require("discord.js");
    var blacklist = [];
    if(message.channel.parent.name != "Hotel"|| message.channel.name==="reception") {message.channel.send("Please use this command in your hotel room!");return}
    if (array[0]==="help") {
      const helpembed = new Discord.MessageEmbed()
      .setColor("#00cfc4")
      .setTitle(".r34 [tags]")
      .addField("Tags","Tags are seperated by spaces, and spaces in any multi-word tags should be underscores. Tag structure example: ``.r34 cat big_dog``")
      .addField("Blacklist","The room blacklist is a list of tags that will not appear on any retrieved images")
      .addField("Usage","When the command is used, an image/gif/video is retrieved from rule34.xxx with all of the mentioned tags. The image has multiple reaction options that do certain things")
      .addField("Reactions","The green reaction brings up a new image with the same tags, the red ones delete the image and either stop or bring up a new image with the same tags, and the yellow one stops the new images")
      .setFooter("The hotel is in no way affiliated with rule34.xxx")
      message.channel.send(helpembed);return;
    }
    if(message.channel.parent.name === "Hotel"&& message.channel.name!="reception") {
      blacklist = message.channel.topic.split(":")[3].split("; ")
      blacklist.shift()
    } 
    for (let i=0;i<blacklist.length;i++) {
        if(array.includes(blacklist[i])) {
          message.channel.send("Sorry, but the tag "+blacklist[i]+" is currently blacklisted."); return;
        }
      }
    function image() {
    Booru.search('r34',array,{limit:10,random:true})
    .then(post => {
      var id;
      try {var link = post[0].fileUrl} catch(err) {message.channel.send("``No images with chosen tags.``");return}
      var post = post.blacklist(blacklist)
      if (post[0]===undefined) {message.channel.send("We could only retrieve blacklisted images from the tags you used, maybe try something else?")}
       const filter = (reaction, user) => {
             return ['❌', '✅', '🟨','🛑','🔧'].includes(reaction.emoji.name) && user.id === message.author.id
        };
      message.channel.send([post[0].fileUrl]).then(msg => {
        msg.react("✅");msg.react("❌");msg.react("🟨");msg.react("🛑");msg.react("🔧")
        msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
        .then(collected =>{
          const reaction = collected.first();
          switch (reaction.emoji.name) {
            case '❌':
              msg.edit("``Image removed. New one generated.``"); image(); msg.delete({timeout: 5000}); break;
            case '🟨':
              message.channel.send("``Feed stopped.``").then(msg => {msg.delete({timeout: 5000})});break;
            case '✅':
              image(); break;
            case '🛑':
              msg.edit("``Feed aborted.``");msg.delete({timeout: 5000});break;
            case "🔧":
              msg.channel.send("```"+post[0].tags.join("; ")+"```")
            default:
              break;
          }
        })
        .catch(() => {message.channel.send('``No response after 60 seconds, feed stopped.``').then(msg => {msg.delete({timeout: 5000})});});
      })
    })
    }
    image()
  }