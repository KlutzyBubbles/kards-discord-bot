const mongoose = require('mongoose');
const Q = require('q');
const log4js = require('log4js');
const logger = log4js.getLogger('user-model');
logger.level = process.env.log_level || 'error';

const Schema = mongoose.Schema;

const NationSchema = new Schema({
	'id': Number,
	'key': Number,
	'short_name': String,
	'name': String,
	'hq': String,
	'hqImage': String,
	'ally_only': Boolean
});

const NationModel = mongoose.model('Nation', NationSchema);

class NationFunctions {

	static putOrReplace(nation_data) {
		const deferred = Q.defer();
		var newData = {
			'id': nation_data.id,
			'key': nation_data.key,
			'short_name': nation_data.shortName,
			'name': nation_data.name,
			'hq': nation_data.hq,
			'hq_image': nation_data.hqImage,
			'ally_only': nation_data.allyOnly
		};
		NationModel.findOneAndUpdate({ id: nation_data.id }, newData, { upsert: true }, function (err) {
			if (err)
				return deferred.reject(err);
			return deferred.resolve();
		});
		return deferred.promise;
	}

	static getById(nation_id) {
		const deferred = Q.defer();
		NationModel.findOne({ id: nation_id }, function (err, nation) {
			if (err)
				return deferred.reject(err);
			return deferred.resolve(nation);
		});
		return deferred.promise;
	}
	
	static shortToId(nation_short_name) {
		const deferred = Q.defer();
		NationModel.findOne({ short_name: nation_short_name }, function (err, nation) {
			if (err)
				return deferred.reject(err);
			return deferred.resolve(nation.id);
		});
		return deferred.promise;
	}

	static nameToId(nation_name) {
		const deferred = Q.defer();
		const regex = new RegExp('.*' + nation_name + '.*', 'i');
		NationModel.findOne({ $or: [ { short_name: regex }, { name: regex } ] }, function (err, nation) {
			if (err)
				return deferred.reject(err);
			return deferred.resolve(nation.id);
		});
		return deferred.promise;
	}

}

module.exports = {
	NationFunctions: NationFunctions,
	NationModel: NationModel,
	NationSchema: NationSchema
};
