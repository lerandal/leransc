module.exports = {
    name: "%docs",
    description: "link for docs",
    execute(msg, server) {
        if (msg.member.roles.cache.find(role => role.name === server.config.role_BotAdmin)) {
            msg.reply("link for docs: " + server.config.link_docs).catch(err => console.error("Error happened."));
        }
    }
};
