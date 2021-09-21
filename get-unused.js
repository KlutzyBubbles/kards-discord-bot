require('cross-fetch/polyfill');
const { ApolloClient, gql } = require('@apollo/client/core');
const { InMemoryCache } = require('@apollo/client/cache');
const Q = require('q');

const log4js = require('log4js');
const logger = log4js.getLogger('test');
logger.level = process.env.log_level || 'error';

const fs = require('fs');
const request = require('request');

var used = [];
var unused = [];
var all = [];

var page = 1;

const client = new ApolloClient({
  uri: 'https://api.kards.com/graphql',
  cache: new InMemoryCache()
});

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
                image: image(language: $language)
            }
        }
    }
}
`;

function getCard() {
    const deferred = Q.defer();
    client.query({
        query: cardsQuery,
        variables: {
            language: 'en',
            q: '',
            pageSize: 100,
            offset: 100 * (page - 1),
            showSpawnables: true
        }
    }).then((result) => {
        logger.trace(result);
        if (result.data.cards.pageInfo.count == 0) {
            deferred.resolve(undefined);
        } else {
            for (var key in result.data.cards.edges) {
                var card = result.data.cards.edges[key];
                if (!used.includes(card.node.json.id)) {
                    unused.push(card.node.json.id);
                    download('https://kards.com' + card.node.image, `images/${card.node.json.id}.png`, function(){});
                }
                all.push(card.node.json.id);
            }
            if (result.data.cards.pageInfo.hasNextPage) {
                logger.info(`Processed page ${page}, moving to next`);
                page += 1;
                return getCard().then(() => {
                    return deferred.resolve();
                }).catch((e) => {
                    return deferred.reject(e);
                });
            } else {
                return deferred.resolve();
            }
        }
    }).catch((e) => {
        logger.error(e);
        if (e.networkError != undefined)
            logger.error(e.networkError.result);
        return deferred.reject(e);
    });
    return deferred.promise;
}

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

function readLines(input) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      used.push(line);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      used.push(remaining);
    }
  });
}

var input = fs.createReadStream('cards.list.txt');
readLines(input);

getCard().then(() => {
    logger.info(unused);
    var file = fs.createWriteStream('unused.txt');
    file.on('error', function(err) { /* error handling */ });
    unused.forEach(function(v) { file.write(v + '\n'); });
    file.end();
    var file = fs.createWriteStream('all.txt');
    file.on('error', function(err) { /* error handling */ });
    all.forEach(function(v) { file.write(v + '\n'); });
    file.end();
}).catch((e) => {
    logger.error(e);
});
