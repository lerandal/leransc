module.exports = {

  name: "%test",

  description: "test",

  execute(msg, server) {

    msg.channel.send("HELLO " + server.config.ID + "!").catch(err => console.error("Error happened."));

  }

};

