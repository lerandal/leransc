var fs = require("fs");

const { templates } = require("handlebars");

module.exports = {
    name: "%results",
    description: "results",
    execute(msg, server, client) {

        // if (server.config.ID == "RAT" || server.config.ID == "SYN" || server.config.ID == "SYN") {

        server.config.scrims.forEach((scrim) => {

            if (scrim.activate_results == true) {


                if (msg.channel.id === scrim.channel_Confirmations) {

                    let apikeyjson = {};

                    fs.readFile("./sheetapikey.json", "utf8", async (err, data) => {

                        if (err) {
                            console.log(`Error reading file from disk: ${err}`);
                        } else {

                            apikeyjson = JSON.parse(data);

                            const { GoogleSpreadsheet } = require('google-spreadsheet');

                            // Initialize the sheet - doc ID is the long id in the sheets URL

                            const doc = new GoogleSpreadsheet(scrim.results.link_code);

                            // https://docs.google.com/spreadsheets/d/1SWxK-92ZYPi_3vuXSa0CaQyPJsTkB814BJFjjtWQYS4/edit?usp=sharing

                            await doc.useServiceAccountAuth({
                                client_email: apikeyjson.client_email,
                                private_key: apikeyjson.private_key,
                            });

                            await doc.loadInfo();

                            let sheet = "";

                            sheet = doc.sheetsByTitle[scrim.results.sheet_title];

                            sheet.headerValues = ['slots', 'teams', 'tags'];

                            await sheet.loadCells('A1:S26');

                            let results = [];

                            for (let index = 1; index <= scrim.max_number_of_teams + scrim.number_of_VIP_slots; index++) {

                                const element = {
                                    team: sheet.getCell(index, 1).value,
                                    tag: sheet.getCell(index, 2).value,
                                    pp1: sheet.getCell(index, 3).value != null ? sheet.getCell(index, 3).value : 0,
                                    kp1: sheet.getCell(index, 4).value != null ? sheet.getCell(index, 4).value : 0,
                                    pp2: sheet.getCell(index, 5).value != null ? sheet.getCell(index, 5).value : 0,
                                    kp2: sheet.getCell(index, 6).value != null ? sheet.getCell(index, 6).value : 0,
                                    pp3: sheet.getCell(index, 7).value != null ? sheet.getCell(index, 7).value : 0,
                                    kp3: sheet.getCell(index, 8).value != null ? sheet.getCell(index, 8).value : 0,
                                    pp4: sheet.getCell(index, 9).value != null ? sheet.getCell(index, 9).value : 0,
                                    kp4: sheet.getCell(index, 10).value != null ? sheet.getCell(index, 10).value : 0,
                                    wwcd: 0,
                                    pp: 0,
                                    kp: 0,
                                    tp: 0,
                                    missed_games: 0
                                };

                                results.push(element);

                            }

                            results.forEach((team) => {

                                [team.pp1, team.pp2, team.pp3, team.pp4].forEach((placement) => {

                                    switch (placement) {
                                        case 1: team.pp += 15; team.wwcd++; break;
                                        case 2: team.pp += 12; break;
                                        case 3: team.pp += 10; break;
                                        case 4: team.pp += 8; break;
                                        case 5: team.pp += 6; break;
                                        case 6: team.pp += 4; break;
                                        case 7: team.pp += 2; break;
                                        case 8: team.pp += 1; break;
                                        case 9: team.pp += 1; break;
                                        case 10: team.pp += 1; break;
                                        case 11: team.pp += 1; break;
                                        case 12: team.pp += 1; break;
                                        case -1: team.missed_games += 1; break;
                                        default: team.pp += 0;
                                    }

                                });

                                team.kp = team.kp1 + team.kp2 + team.kp3 + team.kp4;
                                team.tp = team.pp + team.kp;
                            });

                            results.sort((a, b) => {
                                if (b.tp == a.tp) {
                                    if (b.wwcd == a.wwcd) {
                                        return b.kp - a.kp;
                                        
                                    }
    
                                    return a.wwcd < b.wwcd ? 1 : -1;
                                    
                                }

                                return a.tp < b.tp ? 1 : -1;


                            });

                            client.channels.fetch(msg.channel.id).then(channel => {

                                let text = "Teams that missed games: \n\n";
                                let counter = 0;

                                results.forEach((e, index) => {
                                    if (e.missed_games > 0) {
                                        text += (counter + 1) + ". **__" + e.team + "__** missed **__" + e.missed_games + "__**" + (e.missed_games == 1 ? " game" : " games") + "!\n";
                                        counter++;

                                    }
                                });

                                if (counter == 0) {
                                    text = "No one missed any games! NICE!";
                                }

                                channel.send(text).catch(err => console.error("Error happened."));

                            });

                            results.forEach(async (team, index) => {
                                sheet.getCell((index + 1), 13).value = team.team;
                                sheet.getCell((index + 1), 14).value = team.wwcd;
                                sheet.getCell((index + 1), 15).value = team.pp;
                                sheet.getCell((index + 1), 16).value = team.kp;
                                sheet.getCell((index + 1), 17).value = team.tp;
                            });

                            await sheet.saveUpdatedCells(); // save all updates in one call

                            if (scrim.results.format == "scrim-manager") {

                                var Jimp = require("jimp");
                                var fileName = "";

                                fileName = './images/' + scrim.results.img_blank;

                                var loadedImage;

                                Jimp.read(fileName).then(function (image) {
                                    loadedImage = image;
                                    return Jimp.loadFont("./fonts/" + scrim.results.font);
                                }).then(function (font) {

                                    let y = 295;
                                    let columns = scrim.max_number_of_teams == 20 ? 10 : 9;

                                    for (let index = 0; index < columns; index++) {
                                        loadedImage.print(font, 60, y, index + 1 + ".");
                                        loadedImage.print(font, 135, y, results[index].team);
                                        loadedImage.print(font, 505, y, results[index].wwcd > 0 ? "x" + results[index].wwcd : "");
                                        loadedImage.print(font, (results[index].pp > 9 ? 633 : 633 + 12), y, results[index].pp);
                                        loadedImage.print(font, (results[index].kp > 9 ? 750 : 750 + 12), y, results[index].kp);
                                        loadedImage.print(font, (results[index].tp > 9 ? 865 : 865 + 12), y, results[index].tp);
                                        y += 80;
                                    }

                                    y = 295;

                                    for (let index = columns; index < columns * 2; index++) {
                                        loadedImage.print(font, 1000, y, index + 1 + ".");
                                        loadedImage.print(font, 1078, y, results[index].team);
                                        loadedImage.print(font, 1453, y, results[index].wwcd > 0 ? "x" + results[index].wwcd : "");
                                        loadedImage.print(font, (results[index].pp > 9 ? 1581 : 1581 + 12), y, results[index].pp);
                                        loadedImage.print(font, (results[index].kp > 9 ? 1698 : 1698 + 12), y, results[index].kp);
                                        loadedImage.print(font, (results[index].tp > 9 ? 1813 : 1813 + 12), y, results[index].tp);
                                        y += 80;
                                    }

                                    const d = new Date();

                                    loadedImage.print(font, 1750, 50, d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear() + ".");
                                    loadedImage.write("./images/" + scrim.results.img_done);

                                    const { MessageAttachment } = require("discord.js");

                                    const file = new MessageAttachment("./images/" + scrim.results.img_done);

                                    let resultsText = scrim.results.text_0 +
                                        scrim.results.text_1 + results[0].team +
                                        scrim.results.text_2 + results[1].team +
                                        scrim.results.text_3 + results[2].team +
                                        scrim.results.text_4;

                                    // msg.channel.send(file);

                                    client.channels.fetch(scrim.results.channel_Results).then(channel => {

                                        channel.send(resultsText,
                                            file).catch(err => console.error("Error happened."));

                                    }).catch(err => {
                                        console.error(err);
                                    });


                                }).catch(function (err) {
                                    console.error(err);
                                });

                            } else {
                                var Jimp = require("jimp");
                                var fileName = "";

                                if (msg.channel.id == "940228849764028437") {
                                    fileName = './images/syn_results_blank_20.png';
                                } else {
                                    fileName = './images/syn_results_blank_23.png';
                                }

                                var loadedImage;

                                Jimp.read(fileName).then(function (image) {
                                    loadedImage = image;
                                    return Jimp.loadFont("./fonts/qarmic_sans/_6OxQeMsMusePR5enFWktche.ttf.fnt");
                                }).then(function (font) {

                                    let y = 318;

                                    for (let index = 0; index < 10; index++) {
                                        loadedImage.print(font, 130, y, results[index].team);
                                        loadedImage.print(font, 460, y, "x" + results[index].wwcd);
                                        loadedImage.print(font, (results[index].pp > 9 ? 543 : 543 + 12), y, results[index].pp);
                                        loadedImage.print(font, (results[index].kp > 9 ? 630 : 630 + 12), y, results[index].kp);
                                        loadedImage.print(font, (results[index].tp > 9 ? 715 : 715 + 12), y, results[index].tp);
                                        y += 65;
                                    }

                                    y = 318;

                                    for (let index = 10; index < 20; index++) {
                                        loadedImage.print(font, 923, y, results[index].team);
                                        loadedImage.print(font, 1253, y, "x" + results[index].wwcd);
                                        loadedImage.print(font, (results[index].pp > 9 ? 1336 : 1336 + 12), y, results[index].pp);
                                        loadedImage.print(font, (results[index].kp > 9 ? 1423 : 1423 + 12), y, results[index].kp);
                                        loadedImage.print(font, (results[index].tp > 9 ? 1508 : 1508 + 12), y, results[index].tp);
                                        y += 65;
                                    }

                                    const d = new Date();

                                    loadedImage.print(font, 1350, 170, d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear() + ".");
                                    loadedImage.write("./images/syn_results_jimp.png");

                                    const { MessageAttachment } = require("discord.js");

                                    const file = new MessageAttachment("./images/syn_results_jimp.png");

                                    let resultsChannel = "";
                                    let resultsText = "";

                                    if (msg.channel.id == "940228849764028437") {

                                        resultsChannel = "858881186561654805"; // open results
                                        resultsText = `__**SAIYANS ARMY OPEN SCRIM**__
                                \n<:_award_first:942156427185758269> **` + results[0].team +
                                            `**\n<:_award_second:942156485776003092> **` + results[1].team +
                                            `**\n<:_award_third:942156542403297330> **` + results[2].team +

                                            `**\n\n***Thank you all for participating!***\n***Give us feedback in*** <#914642891165544530>\n\n<@&892502201526812742>`;

                                    } else {

                                        resultsChannel = "940249284983537744"; // late results
                                        resultsText = `__**SAIYANS ARMY LATE NIGHT SCRIM**__
                                \n<:_award_first:942156427185758269> **` + results[0].team +
                                            `**\n<:_award_second:942156485776003092> **` + results[1].team +
                                            `**\n<:_award_third:942156542403297330> **` + results[2].team +

                                            `**\n\n***Thank you all for participating!***\n***Give us feedback in*** <#914642891165544530>\n\n<@&940244851092521020>`;

                                    }

                                    // msg.channel.send(file);

                                    client.channels.fetch(resultsChannel).then(channel => {

                                        channel.send(resultsText,
                                            file).catch(err => console.error("Error happened."));

                                    }).catch(err => {
                                        console.error(err);
                                    });


                                }).catch(function (err) {
                                    console.error(err);
                                });

                            }
                        }
                    });

                }

            }
        }

        );

        // } else {

        //     msg.reply("This command is not available on your server yet!").catch(err => console.error("Error happened."));

        // }

    }

}