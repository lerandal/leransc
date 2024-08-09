var fs = require("fs");



module.exports = {
    name: "%removeunconfirmed",
    description: "Removes slots that are unconfirmed or not confirmed",
    execute(msg, scrim, client, server) {
        if (msg.channel.id === scrim.channel_Confirmations && msg.author.id === client.user.id) { //todo check if its bot or not
            console.log("Called %removeunconfirmed");

            const roleIDPW = msg.guild.roles.cache.find(

                roleIDPW => roleIDPW.name === scrim.role_IDPW

            );

            let members = msg.guild.members.cache.array();

            scrim.slots.forEach((team, index) => {
                console.log("prolaz kroz timove - " + team);
                if (team.confirm != "y" && team.teamTag != "" && team.teamTag != "VIP") {
                    console.log("tim je != y");
                    for (let member of members) {
                        if (member.id == team.teamManager.replace(/[\\<>@#&!]/g, "")) {
                            member.roles.remove(roleIDPW);
                        }
                    }

                    if (index < scrim.max_number_of_teams) {
                        team.teamTag = "";
                        team.teamName = "";
                        team.teamManager = "";
                        team.confirm = "";
                    } else {
                        team.teamTag = "VIP";
                        team.teamName = "VIP";
                        team.teamManager = "";
                        team.confirm = "";
                    }

                    scrim.number_of_teams--;
                }
            });

            // }

            configSave(server);

            client.channels.fetch(scrim.channel_Waitlist).then(channel => {

                let waitlistSize = msg.guild.roles.cache.find(r => r.name === scrim.role_Waitlist).members.map(m => m.user.tag).length;

                channel.messages.fetch(scrim.msg_Waitlist).then(message => {
                    var currentdate = new Date();

                    var datetime = "_Last updated: **" + currentdate.getDate() + "."
                        + (currentdate.getMonth() + 1) + "."
                        + currentdate.getFullYear() + ".** at **"
                        + ((currentdate.getHours() + 2) < 10 ? "0" + (currentdate.getHours() + 2) : currentdate.getHours() + 2) + ":"
                        + (currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes()) + " CEST**_";

                    message.edit("FREE SLOTS: " + (scrim.max_number_of_teams - scrim.number_of_teams) + "\n\nTeams on waitlist: " + waitlistSize + "\n\n" + datetime);

                }).catch(err => {

                    console.error(err);

                });

            });

            // msg.react(server.config.reaction_correct);

            client.commands.get('%slots').execute(msg, server, client);


        }

    }
};





function configSave(config) {



    fs.writeFile("./Config_" + config.ID + ".json", JSON.stringify(config, null, 2), err => {

        if (err) {

            console.log(`Error writing file: ${err}`);

        }

    });



}