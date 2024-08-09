var fs = require("fs");

module.exports = {
    name: "%sheet",
    description: "excel",
    execute(msg, server) {

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

                            const doc = new GoogleSpreadsheet(scrim.results.link_code);
                            // const doc = new GoogleSpreadsheet('1SWxK-92ZYPi_3vuXSa0CaQyPJsTkB814BJFjjtWQYS4');

                            // https://docs.google.com/spreadsheets/d/1SWxK-92ZYPi_3vuXSa0CaQyPJsTkB814BJFjjtWQYS4/edit?usp=sharing

                            await doc.useServiceAccountAuth({
                                client_email: apikeyjson.client_email,
                                private_key: apikeyjson.private_key,
                            });

                            await doc.loadInfo(); // loads document properties and worksheets

                            console.log(doc.title);

                            // if (msg.channel.id == scrim.results.channel_Results) {
                            //     sheet = doc.sheetsByTitle["Syn 20CEST"];
                            // } else {
                            //     sheet = doc.sheetsByTitle["Syn 23CEST"];
                            // }

                            sheet = doc.sheetsByTitle[scrim.results.sheet_title];

                            sheet.headerValues = ['slots', 'teams', 'tags'];

                            await sheet.loadCells('A1:R26');

                            scrim.slots.forEach((slot, index) => {
                                sheet.getCell((index + 1), 0).value = scrim.number_first_slot + index;
                                sheet.getCell((index + 1), 1).value = slot.teamName;
                                sheet.getCell((index + 1), 2).value = slot.teamTag;
                            });

                            for (let r = 1; r <= 24; r++) {
                                for (let c = 3; c <= 10; c++) {
                                    sheet.getCell((r), c).value = "";
                                }


                                for (let c = 13; c <= 17; c++) {
                                    sheet.getCell((r), c).value = "";
                                }
                            }
                            await sheet.saveUpdatedCells();

                        }
                    });
                }
            } 
        });



    }

}