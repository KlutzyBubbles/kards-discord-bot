require('cross-fetch/polyfill');
const { ApolloClient, gql } = require('@apollo/client/core');
const { InMemoryCache } = require('@apollo/client/cache');
const { Permissions } = require('discord.js');

const log4js = require('log4js');
const logger = log4js.getLogger('player-model');
logger.level = process.env.log_level || 'error';

const { SettingsFunctions } = require('../model/settings');

const getString = require('../language/getString');

const client = new ApolloClient({
  uri: 'https://api.kards.com/graphql',
  cache: new InMemoryCache()
});

const languages = [
    'en',
    'de',
    'fr',
    'pl',
    'pt',
    'ru',
    'zh'
];

const pageSizes = [
    5,
    10,
    15
];

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
        showSpawnables: false
    ) {
        pageInfo {
            count
            hasNextPage
        }
        edges {
            node {
                json
                image: image(language: "en")
            }
        }
    }
}
`;

async function onMessage(message) {
    if (!message.content.startsWith('[')) return;
    if (message.author.bot) return;
    if (message.channel.type !== 'text' && message.channel.type !== 'dm') return;

    var settings = { language: 'en', page_size: 5, channels: [] };
    if (message.guild) {
        settings = await SettingsFunctions.getById(message.guild.id);
        logger.trace(message.guild.id);
    }
    logger.trace(settings);

    if (message.content.startsWith('[[[')) {
        // Settings
        if (!message.guild) return;
        var member = await message.guild.members.fetch(message.author.id);
        var permissions = member.permissionsIn(message.channel);
        if (!permissions.any(Permissions.FLAGS.ADMINISTRATOR)) return;
        var arguments = message.content.split('[[[')[1];
        if (arguments == '') return;
        if (arguments.toLowerCase().startsWith('list')) {
            return message.channel.send({
                embed: {
                    color: 3447003,
                    fields: [
                        {
                            name: 'Settings:',
                            value: `Language: ${settings.language}\nPage Size: ${settings.page_size}\nUsable Channels: ${settings.channels.length == 0 ? 'All' : settings.channels.join(', ')}`,
                            inline: true
                        }
                    ]
                }
            });
        } else if (arguments.toLowerCase().startsWith('fix')) {
            // Fix channels errors
            if (settings.channels.length == 0) {
                return message.channel.send(getString(settings.language, 'no_fix'));
            };
            var notFound = settings.channels;
            var channels = await message.guild.channels.cache;
            channels.each((channel) => {
                if (notFound.includes(channel.id.toLowerCase())) {
                    var index = notFound.indexOf(channel.id.toLowerCase());
                    if (index > -1) {
                        notFound.splice(index, 1);
                    }
                }
            });
            for (var i = 0; i < notFound.length; i++) {
                await SettingsFunctions.removeChannel(message.guild.id, notFound[i]);
            }
            return message.channel.send(getString(settings.language, 'fixed'));
        }
        var split = arguments.split(' ');
        if (split.length < 2) {
            return message.channel.send(getString(settings.language, 'arguments_incorrect'));
        }
        logger.trace(split);
        var setting = split[0].toLowerCase();
        if (setting == 'language') {
            logger.trace('language');
            var languageOption = split[1].toLowerCase();
            if (!languages.includes(languageOption)) {
                return message.channel.send(getString(settings.language, 'invalid_language') + languages.join(', '));
            }
            SettingsFunctions.setSetting(message.guild.id, 'language', languageOption).then(() => {
                return message.channel.send(getString(settings.language, 'setting_changed'));
            }).catch((e) => {
                return message.channel.send(getString(settings.language, 'error'));
            });
        } else if (setting == 'page_size') {
            logger.trace('page_size');
            var pageSizeString = split[1];
            try {
                var pageSize = parseInt(pageSizeString);
            } catch {
                return message.channel.send(getString(settings.language, 'error'));
            }
            if (!pageSizes.includes(pageSize)) {
                return message.channel.send(getString(settings.language, 'invalid_page_size') + pageSizes.join(', '));
            }
            SettingsFunctions.setSetting(message.guild.id, 'page_size', pageSize).then(() => {
                return message.channel.send(getString(settings.language, 'setting_changed'));
            }).catch((e) => {
                return message.channel.send(getString(settings.language, 'error'));
            });
        } else if (setting == 'channels') {
            logger.trace('channels');
            if (split.length < 3) {
                return message.channel.send(getString(settings.language, 'arguments_incorrect'));
            }
            var action = split[1].toLowerCase();
            var channel = split[2].toLowerCase();
            if (action == 'add') {
                await message.mentions.channels.each(async (channel) => {
                    await SettingsFunctions.addChannel(message.guild.id, channel.id);
                });
                return message.channel.send(getString(settings.language, 'setting_changed'));
            } else if (action == 'remove') {
                await message.mentions.channels.each(async (channel) => {
                    await SettingsFunctions.removeChannel(message.guild.id, channel.id);
                });
                return message.channel.send(getString(settings.language, 'setting_changed'));
            } else {
                return message.channel.send(getString(settings.language, 'invalid_action'));
            }
        }
    } else if (message.content.startsWith('[[')) {
        // Card Search List
        if (message.content == '[[');
        if (settings.channels.length > 0) {
            if (!settings.channels.includes(message.channel.id.toLowerCase())) return;
        }
        message.channel.send(getString(settings.language, 'wip'));
    } else {
        // Card search by name
        if (settings.channels.length > 0) {
            if (!settings.channels.includes(message.channel.id.toLowerCase())) return;
        }
        var search = message.content.split('[')[1];
        if(search.charAt(search.length - 1) == "]") {
            search = search.slice(0, -1);
        }
        if (search == '') return;
        client.query({
            query: cardsQuery,
            variables: {
                language: settings.language,
                q: search,
                first: 1,
                offset: 0
            }
        }).then((result) => {
            logger.trace(result);
            if (result.data.cards.pageInfo.count == 0) {
                message.channel.send(getString(settings.language, 'no_results'));
            } else {
                message.channel.send({ files: [{
                    attachment: 'https://kards.com' + result.data.cards.edges[0].node.image,
                    name: result.data.cards.edges[0].node.json.title.en + '.png'
                }] });
            }
        }).catch((e) => {
            logger.error(e);
            message.channel.send(getString(settings.language, 'error'));
        });
    }
}

module.exports = {
    onMessage
};