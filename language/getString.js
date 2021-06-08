const strings = require('./strings.json');

module.exports = function(language, string) {
    if (Object.prototype.hasOwnProperty.call(strings, language)) {
        if (Object.prototype.hasOwnProperty.call(strings[language], string)) {
            return strings[language][string];
        }
        return 'Cannot find set string in language';
    }
    return 'Cannot find language currently set';
}