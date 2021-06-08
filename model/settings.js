const mongoose = require('mongoose');
const Q = require('q');
const log4js = require('log4js');
const logger = log4js.getLogger('player-model');
logger.level = process.env.log_level || 'error';

const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
	'server_id': String,
	'language': String,
	'page_size': Number,
	'channels': [String]
});

const SettingsModel = mongoose.model('Settings', SettingsSchema);

/*
{
    "id": "en",
    "code": "en-us",
    "name": "English"
},
{
    "id": "de",
    "code": "de-de",
    "name": "Deutsch"
},
{
    "id": "fr",
    "code": "fr-fr",
    "name": "Français"
},
{
    "id": "pl",
    "code": "pl",
    "name": "Polski"
},
{
    "id": "pt",
    "code": "pt-br",
    "name": "Português"
},
{
    "id": "ru",
    "code": "ru",
    "name": "Pусский"
},
{
    "id": "zh",
    "code": "zh-cn",
    "name": "中文"
}
*/

class SettingsFunctions {

	static getById(id) {
		const deferred = Q.defer();
		SettingsModel.findOne({ server_id: id }, function (err, settings) {
			if (err) {
				deferred.reject(err);
			} else {
				deferred.resolve(settings);
			}
		});
		return deferred.promise;
	}

	static putServer(id) {
		const deferred = Q.defer();
        SettingsFunctions.getById(id).then((settings) => {
            if (!settings) {
                (new SettingsModel({
                    server_id: id,
                    language: 'en',
                    page_size: 10,
                    channels: []
                })).save().then((settings) => {
                    deferred.resolve(settings);
                }).catch((e) => {
                    logger.error(e);
                    deferred.reject(e);
                });
            }
        }).catch((e) => {
            deferred.reject(e);
        });
		return deferred.promise;
	}

    static setSetting(id, name, value) {
		const deferred = Q.defer();
        SettingsFunctions.getById(id).then((settings) => {
            if (!settings) {
                var settings = {
                    server_id: id,
                    language: 'en',
                    page_size: 10,
                    channels: []
                };
                settings[name] = value;
                (new SettingsModel(settings)).save().then((settings) => {
                    deferred.resolve(settings);
                }).catch((e) => {
                    logger.error(e);
                    deferred.reject(e);
                });
            } else {
                settings[name] = value;
                settings.save().then((settings) => {
                    deferred.resolve(settings);
                }).catch((e) => {
                    logger.error(e);
                    deferred.reject(e);
                });
            }
        }).catch((e) => {
            deferred.reject(e);
        });
		return deferred.promise;
    }
    
    static addChannel(id, channel) {
		const deferred = Q.defer();
        SettingsFunctions.getById(id).then((settings) => {
            if (!settings) {
                var settings = {
                    server_id: id,
                    language: 'en',
                    page_size: 10,
                    channels: [
                        channel.toLowerCase()
                    ]
                };
                (new SettingsModel(settings)).save().then((settings) => {
                    deferred.resolve(settings);
                }).catch((e) => {
                    logger.error(e);
                    deferred.reject(e);
                });
            } else {
                if (!settings.channels.includes(channel.toLowerCase())) {
                    settings.channels.push(channel.toLowerCase());
                    settings.save().then((settings) => {
                        deferred.resolve(settings);
                    }).catch((e) => {
                        logger.error(e);
                        deferred.reject(e);
                    });
                } else {
                    deferred.resolve(settings);
                }
            }
        }).catch((e) => {
            deferred.reject(e);
        });
		return deferred.promise;
    }

    static removeChannel(id, channel) {
		const deferred = Q.defer();
        SettingsFunctions.getById(id).then((settings) => {
            if (!settings) {
                var settings = {
                    server_id: id,
                    language: 'en',
                    page_size: 10,
                    channels: []
                };
                (new SettingsModel(settings)).save().then((settings) => {
                    deferred.resolve(settings);
                }).catch((e) => {
                    logger.error(e);
                    deferred.reject(e);
                });
            } else {
                if (settings.channels.includes(channel.toLowerCase())) {
                    var index = settings.channels.indexOf(channel.toLowerCase());
                    if (index > -1) {
                        settings.channels.splice(index, 1);
                    }
                    settings.save().then((settings) => {
                        deferred.resolve(settings);
                    }).catch((e) => {
                        logger.error(e);
                        deferred.reject(e);
                    });
                } else {
                    deferred.resolve(settings);
                }
            }
        }).catch((e) => {
            deferred.reject(e);
        });
		return deferred.promise;
    }

}

module.exports = {
	SettingsFunctions,
	SettingsModel,
	SettingsSchema
};
