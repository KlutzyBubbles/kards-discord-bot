const mongoose = require('mongoose');
const Q = require('q');
const log4js = require('log4js');
const logger = log4js.getLogger('model-settings');
logger.level = process.env.log_level || 'error';

const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
	'server_id': String,
	'language': String,
	'page_size': Number,
	'channels': [String],
    'search': Boolean,
    'prefix': String,
    'suffix': String
});

const defaultSettings = {
    language: 'en',
    page_size: 10,
    channels: [],
    search: false,
    prefix: '[',
    suffix: ']'
};

const SettingsModel = mongoose.model('Settings', SettingsSchema);

function addDefaults(document) {
    logger.trace('addDefaults');
    logger.debug(document);
    var object = document == undefined ? {} : document.toObject();
    for (var key in defaultSettings) {
        if (!Object.hasOwnProperty.call(object, key)) {
            logger.trace(`no property ${key}`);
            document[key] = defaultSettings[key];
        }
    }
    return document;
}

class SettingsFunctions {

	static getById(id) {
		const deferred = Q.defer();
		SettingsModel.findOne({ server_id: id }, function (err, settings) {
			if (err) {
				deferred.reject(err);
			} else {
				deferred.resolve(addDefaults(settings));
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
                    ...defaultSettings
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
                    ...defaultSettings
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
                    ...defaultSettings
                };
                settings.channels = [
                    channel.toLowerCase()
                ]
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
                    ...defaultSettings
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

    static getDefaultSettings() {
        return {
            ...defaultSettings
        };
    }

}

module.exports = {
	SettingsFunctions,
	SettingsModel,
	SettingsSchema
};
