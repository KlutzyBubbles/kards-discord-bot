require('cross-fetch/polyfill');
const { ApolloClient } = require('@apollo/client/core');
const { InMemoryCache } = require('@apollo/client/cache');
const mongoose = require('mongoose');

const log4js = require('log4js');
const logger = log4js.getLogger('data-index');
logger.level = process.env.log_level || 'error';

const { updateNations } = require('./nations');

mongoose.connect(getMongooseConfig(), { useNewUrlParser: true, useUnifiedTopology: true });

const client = new ApolloClient({
  uri: 'https://api.kards.com/graphql',
  cache: new InMemoryCache()
});

updateNations(client);

function getMongooseConfig() {
	return 'mongodb+srv://' + process.env.mdb_username + ':' + process.env.mdb_password + '@' + process.env.mdb_cluster_url + '/' + process.env.mdb_database + '?retryWrites=true&w=majority';
}
