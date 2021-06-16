require('cross-fetch/polyfill');
const { gql } = require('@apollo/client/core');

const log4js = require('log4js');
const logger = log4js.getLogger('data-nations');
logger.level = process.env.log_level || 'error';

const { NationFunctions } = require('../model/nation');

const getString = require('../language/getString');

const cardsQuery = gql `
query {
    nations {
        edges {
            node {
                id
                key
                shortName
                name
                hq
                hqImage
                allyOnly
            }
        }
    }
}
`;

function updateNations(client) {
    client.query({
        query: cardsQuery
    }).then((result) => {
        logger.trace(result);
        for (var i = 0; i < result.data.nations.edges.length; i++) {
            logger.debug(result.data.nations.edges[i]);
            NationFunctions.putOrReplace(result.data.nations.edges[i].node).then(() => {
                logger.trace('Success')
            }).catch((e) => {
                logger.error(e);
            });
        }
    }).catch((e) => {
        logger.error(e);
        message.channel.send(getString(settings.language, 'error'));
    });
}

module.exports = {
    updateNations
}