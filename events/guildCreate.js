const log4js = require('log4js');
const logger = log4js.getLogger('player-model');
logger.level = process.env.log_level || 'error';

const { SettingsFunctions } = require('../model/settings');

async function onGuildCreate(guild) {
    SettingsFunctions.putServer(guild.id);
}

module.exports = {
    onGuildCreate
};