var fs = require("fs");



module.exports = {

    name: "%lock",

    description: "Locks channel for registrations",

    execute(msg, server) {

        server.config.scrims.forEach((scrim) => {



            if (msg.channel.id === scrim.channel_Registrations) {

                if (

                    msg.member.roles.cache.find(role => role.name === server.config.role_BotAdmin)

                ) {



                    msg.channel.updateOverwrite(msg.guild.roles.cache.find(role => role.name === scrim.role_Registrations), { VIEW_MESSAGES: true, SEND_MESSAGES: false });

                    msg.channel.updateOverwrite(msg.guild.roles.cache.find(role => role.name === scrim.role_Vip_1), { VIEW_MESSAGES: true, SEND_MESSAGES: false });



                    if (scrim.role_Vip_2 != "") {

                        msg.channel.updateOverwrite(msg.guild.roles.cache.find(role => role.name === scrim.role_Vip_2), { VIEW_MESSAGES: true, SEND_MESSAGES: false });

                    }



                    if (scrim.role_Vip_3 != "") {

                        msg.channel.updateOverwrite(msg.guild.roles.cache.find(role => role.name === scrim.role_Vip_3), { VIEW_MESSAGES: true, SEND_MESSAGES: false });

                    }



                    if (scrim.role_Vip_4 != "") {

                        msg.channel.updateOverwrite(msg.guild.roles.cache.find(role => role.name === scrim.role_Vip_4), { VIEW_MESSAGES: true, SEND_MESSAGES: false });

                    }



                    scrim.is_open_Registrations = false;

                    scrim.is_open_Waitlist = false;

                    configSave(server.config);



                    msg.channel.send(scrim.text_lock_regs).catch(err => console.error("Error happened."));

                } else {

                    msg.reply("only bot admins can use this command.").catch(err => console.error("Error happened."));

                }

            }

        });

    }

};



function configSave(config) {



    fs.writeFile("./Config_" + config.ID + ".json", JSON.stringify(config, null, 2), err => {

        if (err) {

            console.log(`Error writing file: ${err}`);

        }

    });



}



