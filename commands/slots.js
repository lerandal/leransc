var fs = require("fs");

module.exports = {

    name: "%slots",

    description: "Updates slot list",

    async execute(msg, server, client, test = false) {

        let server_POMOCNA;

        if (msg.author != null && msg.author.id === client.user.id && test == false) {
            server_POMOCNA = server.scrims;
        } else {
            server_POMOCNA = server.config.scrims;
        }

        try {

            server_POMOCNA.forEach((scrim) => {

                if (msg.channel.id === scrim.channel_Confirmations

                    || msg.channel.id === scrim.channel_IDPW

                    || msg.channel.id === scrim.channel_Registrations

                    || msg.channel.id === scrim.channel_Waitlist) {

                    let text = scrim.text_slots;

                    let i = 1;

                    let slot = [];

                    for (number = scrim.number_first_slot; number < scrim.max_number_of_teams + scrim.number_first_slot + scrim.number_of_VIP_slots; number++) {

                        slot.push(number < 10 ? "0" + number : "" + number);

                    }

                    if (scrim.slots.length > 0) {

                        scrim.slots.forEach(team => {
                            text =
                                text +
                                "**" + slot[i - 1] + ".**" +
                                (team.confirm == "y" ? " `[" + team.teamTag.trim() + "]` __**" + team.teamName.trim() + "**__" :
                                    (team.confirm == "n" ? "~~`[" + team.teamTag.trim() + "]` " + team.teamName.trim() + "~~" :
                                        " `[" + team.teamTag.trim() + "]` " + team.teamName.trim())
                                ) + " " + team.teamManager.trim() + "\n";

                            i++;

                        });

                    }

                    try {

                        var currentdate = new Date();

                        var datetime = "_Last updated: **" + currentdate.getDate() + "."

                            + (currentdate.getMonth() + 1) + "."

                            + currentdate.getFullYear() + ".** at **"

                            + ((currentdate.getHours() + 2) < 10 ? "0" + (currentdate.getHours() + 2) : currentdate.getHours() + 2) + ":"

                            + (currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes()) + " CEST**_";


                        client.channels.fetch(scrim.channel_IDPW).then(channel => {

                            channel.messages.fetch(scrim.msg_IDPW).then(message => {
                                message.edit(text + "\n" + datetime);
                            }).catch(err => {

                                channel.send(text + "\n" + datetime).then(sent => {
                                    server_POMOCNA.forEach((scrim) => {
                                        if (channel.id === scrim.channel_IDPW) {
                                            scrim.msg_IDPW = sent.id;
                                        }
                                    });

                                    configSave((msg.author != null && msg.author.id === client.user.id && test == false) ? server : server.config);

                                    sent.pin();
                                });

                            });

                        });



                        client.channels.fetch(scrim.channel_Confirmations).then(channel => {

                            channel.messages.fetch(scrim.msg_Slots).then(message => {

                                message.edit(text + "\n" + datetime);

                            }).catch(err => {

                                channel.send(text + "\n" + datetime).then(sent => {

                                    server_POMOCNA.forEach((scrim) => {
                                        if (channel.id === scrim.channel_Confirmations) {
                                            scrim.msg_Slots = sent.id;
                                        }
                                    });

                                    configSave((msg.author != null && msg.author.id === client.user.id && test == false) ? server : server.config);

                                    sent.pin();

                                });
                            });

                        });



                        client.channels.fetch(scrim.channel_Waitlist).then(channel => {

                            let waitlistSize = msg.guild.roles.cache.find(r => r.name === scrim.role_Waitlist).members.map(m => m.user.tag).length;

                            channel.messages.fetch(scrim.msg_Waitlist).then(message => {

                                message.edit("FREE SLOTS: " + (scrim.max_number_of_teams - scrim.number_of_teams) + "\n\nTeams on waitlist: " + waitlistSize + "\n\n" + datetime);

                            }).catch(err => {

                                channel.send("FREE SLOTS: " + (scrim.max_number_of_teams - scrim.number_of_teams) + "\n\nTeams on waitlist: " + waitlistSize + "\n\n" + datetime).then(sent => {

                                    server_POMOCNA.forEach((scrim) => {
                                        if (channel.id === scrim.channel_Waitlist) {
                                            scrim.msg_Waitlist = sent.id;
                                        }
                                    });

                                    configSave((msg.author != null && msg.author.id === client.user.id && test == false) ? server : server.config);
                                    sent.pin();
                                });
                            });

                        });



                    } catch (error) {

                        console.error(error);

                    }

                }

            });
        } catch (err) {
            console.log(err);
            console.log("Slots did not update.");
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