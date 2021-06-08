const Discord = require("discord.js");
const client = new Discord.Client();

const log4js = require('log4js');
const logger = log4js.getLogger('kards-bot');
const mongoose = require('mongoose');

logger.level = process.env.log_level || 'error';

const { onMessage } = require('./events/message');
const { onGuildCreate } = require('./events/guildCreate');

mongoose.connect(getMongooseConfig(), { useNewUrlParser: true, useUnifiedTopology: true });

client.once('ready', () => {
	logger.info('Bot is ready!');
});

client.on('message', (message) => {
	onMessage(message);
});

client.on('guildCreate', (guild) => {
	onGuildCreate(guild);
});

client.login(process.env.discord_token);

function getMongooseConfig() {
	return 'mongodb+srv://' + process.env.mdb_username + ':' + process.env.mdb_password + '@' + process.env.mdb_cluster_url + '/' + process.env.mdb_database + '?retryWrites=true&w=majority';
}
