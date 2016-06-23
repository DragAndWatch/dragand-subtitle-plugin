'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSubs = exports.getSerieId = exports.scrapper = exports.compareReleaseGroup = exports.getStatus = exports.mapping = undefined;

var _natural = require('natural');

var _natural2 = _interopRequireDefault(_natural);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var addic7edLanguagesMapping = {
  'sq': '52',
  'ar': '38',
  'arm': '50',
  'az': '48',
  'bn': '47',
  'bs': '44',
  'bg': '35',
  'ca': '12',
  'cn': '41',
  'zh': '24',
  'hr': '31',
  'cs': '14',
  'da': '30',
  'nl': '17',
  'en': '1',
  'est': '54',
  'eu': '13',
  'fi': '28',
  'fr': '8',
  'fr-ca': '53',
  'gl': '15',
  'de': '11',
  'el': '27',
  'he': '23',
  'hin': '55',
  'hu': '20',
  'ice': '56',
  'id': '37',
  'it': '7',
  'ja': '32',
  'ko': '42',
  'lav': '57',
  'lit': '58',
  'mk': '49',
  'ms': '40',
  'no': '29',
  'fa': '43',
  'pl': '21',
  'pt': '9',
  'pt-br': '10',
  'ro': '26',
  'ru': '19',
  'sr': '39',
  'sr-la': '36',
  'sk': '25',
  'sl': '22',
  'es': '4',
  'es-la': '6',
  'es-es': '5',
  'sv': '18',
  'tam': '59',
  'th': '46',
  'tr': '16',
  'ukr': '51',
  'vi': '45'
};

/**
 * Get the right langauge addic7ed code
 *
 *  @param {string} language
 *
 *  @return {string} correpond language code
 */
var mapping = exports.mapping = function mapping(language) {
  return addic7edLanguagesMapping[language];
};

/**
 *  Check if the subtitles is ready
 *
 *  @param  {string} string
 *  @return {boolean}
 */
var getStatus = exports.getStatus = function getStatus(string) {
  return string == 'Completed' ? 100 : parseInt(string.replace(' Completed', '').replace('%', ''));
};

/**
 * Compare release group
 *
 *  @param {string} file
 *  @param {string} addicted releaseFile
 *
 *  @return {boolean}
 */
var compareReleaseGroup = exports.compareReleaseGroup = function compareReleaseGroup(releaseFile, releaseAddic7ed) {

  releaseFile = releaseFile.toLowerCase();
  releaseAddic7ed = releaseAddic7ed.toLowerCase();

  if (releaseFile != releaseAddic7ed) {
    var diceScore = _natural2.default.JaroWinklerDistance(releaseFile, releaseAddic7ed);
    return diceScore >= 0.5 ? true : false;
  }

  return true;
};

/**
 * Scrapper for all series form addic7ed
 *
 *  @param {function} callback(shows)
 */
var scrapper = exports.scrapper = function scrapper(cb) {
  var shows = [];
  (0, _request2.default)('http://www.addic7ed.com/shows.php', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      (function () {
        var $ = _cheerio2.default.load(body);
        $('h3 > a').each(function (index, element) {
          shows.push({
            name: $(element).text(),
            id: $(element).attr('href').split('/')[2]
          });
        });
        cb(null, shows);
      })();
    } else {
      cb(error, shows);
    }
  });
};

/**
 * Get the serie from the addic7ed series id mapping
 *
 *  @param {Object} addic7ed mapping series
 *  @param {string} seriesName
 *
 *  @return {promise}
 */
var getSerieId = exports.getSerieId = function getSerieId(addic7edSeriesMapping, serieName) {
  var deferred = _q2.default.defer();

  if (!addic7edSeriesMapping) {
    deferred.reject('No scrapping available');
  } else {
    // get the serie id by reducing the series mapping
    var serieIds = Object.keys(addic7edSeriesMapping).reduce(function (potentialSerieId, key) {
      var currentSerieName = addic7edSeriesMapping[key].name;

      // When the serie match perfectly the name
      if (currentSerieName.toLowerCase() === serieName.toLowerCase()) {
        return [].concat(_toConsumableArray(potentialSerieId), [{
          name: currentSerieName,
          score: 1,
          id: addic7edSeriesMapping[key].id
        }]);
      }

      // Calcul of the matching coefficient
      return [].concat(_toConsumableArray(potentialSerieId), [{
        name: currentSerieName,
        id: addic7edSeriesMapping[key].id,
        score: _natural2.default.DiceCoefficient(currentSerieName, serieName)
      }]);
    }, []).sort(function (a, b) {
      return b.score - a.score;
    }); // sort by score

    if (serieIds.length == 0) {
      deferred.reject('no mathing series found on addic7ed...');
      return deferred.promise;
    }
    if (serieIds[0].score >= 0.8) {
      deferred.resolve(serieIds[0].id);
    } else {
      deferred.reject('no mathing series found on addic7ed...');
    }
  }

  return deferred.promise;
};

/**
 * Get all subs matching with parameters
 *
 *  @param {string} url
 *  @param {integer} episode
 *  @param {string} releaseGroup
 *
 *  @return {promise}
 */
var getSubs = exports.getSubs = function getSubs(url, episode, releaseGroup) {
  var deferred = _q2.default.defer();
  var subtitles = [];

  // Request to addic7ed
  (0, _request2.default)(url, function (err, response, body) {
    if (err) return deferred.reject('no mathing subtitles found on addic7ed...');

    if (!err && response.statusCode === 200) {
      (function () {

        // Load cheerio
        var $ = _cheerio2.default.load(body);

        // Addicted scrapped language name and id
        var addic7edLanguages = {};

        // Get languages by english fullname
        $('div#langs tbody tr').each(function (index, row) {
          var fullLanguageName = $($(row).find('td')[0]).text().trim();
          var id = $($($(row).find('td')[1]).find('input')).attr('id').trim().split('lang')[1];
          addic7edLanguages[fullLanguageName] = id;
        });

        // Loop over subtitles
        $('div#season tbody tr.epeven.completed').each(function (i, row) {
          var columns = $(row).find('td');
          var releaseValid = compareReleaseGroup(releaseGroup, $(columns[4]).text());
          var isEpisode = function isEpisode(column, episode) {
            return column.text() == String(episode);
          };
          var percent = getStatus($(columns[5]).text());

          // Simple get the ISO-639-1 from english full language name
          var getLanguage = function getLanguage(id) {
            return Object.keys(addic7edLanguagesMapping).reduce(function (language, key) {
              return addic7edLanguagesMapping[key] == id ? key : language;
            }, null);
          };

          if (isEpisode($(columns[1]), episode) && releaseValid) {
            if (percent >= 90) {
              subtitles.push({
                language: getLanguage(addic7edLanguages[$(columns[3]).text().trim()]),
                releaseGroup: $(columns[4]).text(),
                url: $(columns[9]).find('a').first().attr('href')
              });
            }
          }
        });

        deferred.resolve(subtitles);
      })();
    }
  });

  return deferred.promise;
};