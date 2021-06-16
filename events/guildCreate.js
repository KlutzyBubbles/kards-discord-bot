const log4js = require('log4js');
const logger = log4js.getLogger('events-guildCreate');
logger.level = process.env.log_level || 'error';

const { SettingsFunctions } = require('../model/settings');

async function onGuildCreate(guild) {
    logger.trace('onGuildCreate');
    logger.debug(`Guild id: ${guild.id}`);
    SettingsFunctions.putServer(guild.id).then((settings) => {
        logger.trace('Saved');
        logger.debug(settings);
    }).catch((e) => {
        logger.error(e);
    });
}

module.exports = {
    onGuildCreate
};