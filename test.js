require('cross-fetch/polyfill');
const { ApolloClient, gql } = require('@apollo/client/core');
const { InMemoryCache } = require('@apollo/client/cache');
const Q = require('q');

const log4js = require('log4js');
const logger = log4js.getLogger('test');
logger.level = process.env.log_level || 'error';

const fs = require('fs');
var os = require('os');

const client = new ApolloClient({
  uri: 'https://api.kards.com/graphql',
  cache: new InMemoryCache()
});
const cards = require('./cards.json');

const cardsQuery = gql `
query getCards(
    $language: String
    $nationIds: [Int]
    $pageSize: Int
    $offset: Int
    $kredits: [Int]
    $q: String
    $type: [String]
    $rarity: [String]
    $set: [String]
    $showSpawnables: Boolean
) {
    cards(
        language: $language
        first: $pageSize
        offset: $offset
        nationIds: $nationIds
        kredits: $kredits
        q: $q
        type: $type
        set: $set
        rarity: $rarity
        showSpawnables: $showSpawnables
    ) {
        pageInfo {
            count
            hasNextPage
        }
        edges {
            node {
                json
            }
        }
    }
}
`;

function getCard(search) {
    const deferred = Q.defer();
    client.query({
        query: cardsQuery,
        variables: {
            language: 'en',
            q: search,
            pageSize: 1,
            offset: 0,
            showSpawnables: true
        }
    }).then((result) => {
        logger.trace(result);
        if (result.data.cards.pageInfo.count == 0) {
            deferred.resolve(undefined);
        } else {
            deferred.resolve(result.data.cards.edges[0].node.json.id);
        }
    }).catch((e) => {
        logger.error(e);
        if (e.networkError != undefined)
            logger.error(e.networkError.result);
        return deferred.reject(e);
    });
    return deferred.promise;
}

async function processCard(message) {
    var split = message.startsWith('card_unit_') ? message.split('card_unit_')[1].split('_') : message.split('card_event_')[1].split('_');
    var options = [];
    options.push(split.join(' '));
    var previous = '';
    var constructed = '';
    var constructed2 = '';
    var constructed3 = '';
    var constructed4 = '';
    var prefix = '';
    var prefix2 = '';
    var prefix3 = '';
    var prefix4 = '';
    for (var key in split) {
        if (previous.match(/^\d+$/)) {
            prefix = '-';
            prefix2 = '-';
            prefix3 = ' ';
            prefix4 = ' ';
        }
        if (previous.match(/^.{1,2}$/)) {
            prefix = '-';
            prefix2 = ' ';
            prefix3 = '-';
            prefix4 = ' ';
        }
        if (key == 0) {
            prefix = '';
            prefix2 = '';
            prefix3 = '';
            prefix4 = '';
        }
        constructed += prefix + split[key];
        constructed2 += prefix2 + split[key];
        constructed3 += prefix3 + split[key];
        constructed4 += prefix4 + split[key];
    }
    options.push(constructed);
    options.push(constructed2);
    options.push(constructed3);
    options.push(constructed4);
    var found = false;
    for (var key in options) {
        try {
            var card = await getCard(options[key]);
            if (card != undefined && card != '') {
                found = true;
                await fs.appendFileSync('cards.csv', `${message},${card}${os.EOL}`);
                break;
            }
        } catch(e) {
            logger.error(e);
        }
    }
    if (!found)
        await fs.appendFileSync('cards.csv', `${message},${os.EOL}`);
}

(async function () {
    for (var key in cards.names) {
        await processCard(cards.names[key]);
    }
})().then(() => logger.info('done with cursor') );

