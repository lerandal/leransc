var fs = require("fs");



module.exports = {

    name: "%reactConfirmation",

    description: "Confirms or cancels based on reactions",

    execute(reaction, user, server, client) {

        server.config.scrims.forEach((scrim) => {

            if (reaction.message.id == scrim.msg_Confirmation) {

                if (reaction.emoji.id == server.config.reaction_correct) {

                    scrim.slots.forEach(team => {

                        if (team.teamManager.replace(/[\\<>@#&!]/g, "") == user.id) {

                            team.confirm = "y";

                            user.send("Hello, you **__confirmed__** your slot for " + scrim.text_dm_confirmation).catch(err => console.error("Error happened."));

                            configSave(server.config);

                        }

                    });

                }



                if (reaction.emoji.id == server.config.reaction_incorrect) {

                    scrim.slots.forEach(team => {

                        if (team.teamManager.replace(/[\\<>@#&!]/g, "") == user.id) {

                            team.confirm = "n";

                            configSave(server.config);

                            user.send("Hello, you **__canceled__** your slot for " + scrim.text_dm_confirmation).catch(err => console.error("Error happened."));

                        }

                    });

                }

                client.commands.get('%slots').execute(reaction.message, server, client, true);

            }

        });

    }

}



function configSave(config) {



    fs.writeFile("./Config_" + config.ID + ".json", JSON.stringify(config, null, 2), err => {

        if (err) {

            console.log(`Error writing file: ${err}`);

        }

    });



}