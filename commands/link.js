module.exports = {
    name: "%link",
    description: "link for results",
    execute(msg, server) {
        if (msg.member.roles.cache.find(role => role.name === server.config.role_BotAdmin)) {
            msg.reply("link for results: " + server.config.link_results).catch(err => console.error("Error happened."));
        }
    }
};
