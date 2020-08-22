module.exports = (client,message,array) => {
    console.log("Checking in.");
    client.user.setPresence({ activity: { name: 'for .hotel help', type:'WATCHING' }, status: 'online' });
  }