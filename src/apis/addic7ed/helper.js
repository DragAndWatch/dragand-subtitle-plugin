import natural from 'natural';
import request from 'request';
import cheerio from 'cheerio';
import Q from 'q';


const addic7edLanguagesMapping = {
  'sq'   : '52',
  'ar'   : '38',
  'arm'  : '50',
  'az'   : '48',
  'bn'   : '47',
  'bs'   : '44',
  'bg'   : '35',
  'ca'   : '12',
  'cn'   : '41',
  'zh'   : '24',
  'hr'   : '31',
  'cs'   : '14',
  'da'   : '30',
  'nl'   : '17',
  'en'   : '1',
  'est'  : '54',
  'eu'   : '13',
  'fi'   : '28',
  'fr'   : '8',
  'fr-ca': '53',
  'gl'   : '15',
  'de'   : '11',
  'el'   : '27',
  'he'   : '23',
  'hin'  : '55',
  'hu'   : '20',
  'ice'  : '56',
  'id'   : '37',
  'it'   : '7',
  'ja'   : '32',
  'ko'   : '42',
  'lav'  : '57',
  'lit'  : '58',
  'mk'   : '49',
  'ms'   : '40',
  'no'   : '29',
  'fa'   : '43',
  'pl'   : '21',
  'pt'   : '9',
  'pt-br': '10',
  'ro'   : '26',
  'ru'   : '19',
  'sr'   : '39',
  'sr-la': '36',
  'sk'   : '25',
  'sl'   : '22',
  'es'   : '4',
  'es-la': '6',
  'es-es': '5',
  'sv'   : '18',
  'tam'  : '59',
  'th'   : '46',
  'tr'   : '16',
  'ukr'  : '51',
  'vi'   : '45'
};

/**
 * Get the right langauge addic7ed code
 *
 *  @param {string} language
 *
 *  @return {string} correpond language code
 */
export const mapping = (language) => addic7edLanguagesMapping[language];


/**
 *  Check if the subtitles is ready
 *
 *  @param  {string} string
 *  @return {boolean}
 */
export const getStatus = (string) => string == 'Completed' ? 100 : parseInt(string.replace(' Completed', '').replace('%', ''));

/**
 * Compare release group
 *
 *  @param {string} file
 *  @param {string} addicted releaseFile
 *
 *  @return {boolean}
 */
export const compareReleaseGroup = (releaseFile, releaseAddic7ed) => {

  releaseFile = releaseFile.toLowerCase();
  releaseAddic7ed = releaseAddic7ed.toLowerCase();

  if(releaseFile != releaseAddic7ed) {
    const diceScore = natural.JaroWinklerDistance(releaseFile, releaseAddic7ed);
    return (diceScore >= 0.5) ? true : false;
  }

  return true;
};

/**
 * Scrapper for all series form addic7ed
 *
 *  @param {function} callback(shows)
 */
export const scrapper = (cb) => {
  const shows = [];
  request('http://www.addic7ed.com/shows.php', (error, response, body) => {
    if(!error && response.statusCode === 200) {
      const $ = cheerio.load(body);
      $('h3 > a').each( (index, element) => {
        shows.push({
          name: $(element).text(),
          id : $(element).attr('href').split('/')[2]
        });
      });
      cb(null, shows);
    }else {
      cb(error, shows);
    }
  });
}

/**
 * Get the serie from the addic7ed series id mapping
 *
 *  @param {Object} addic7ed mapping series
 *  @param {string} seriesName
 *
 *  @return {promise}
 */
export const getSerieId = (addic7edSeriesMapping, serieName) => {
  let deferred = Q.defer();

  if (!addic7edSeriesMapping) {
    deferred.reject('No scrapping available');
  } else {
    // get the serie id by reducing the series mapping
    const serieIds = Object.keys(addic7edSeriesMapping).reduce( (potentialSerieId, key) => {
      let currentSerieName = addic7edSeriesMapping[key].name;

      // When the serie match perfectly the name
      if(currentSerieName.toLowerCase() === serieName.toLowerCase()) {
        return [...potentialSerieId, {
          name: currentSerieName,
          score: 1,
          id: addic7edSeriesMapping[key].id
        }];
      }

      // Calcul of the matching coefficient
      return [
        ...potentialSerieId,
        {
          name: currentSerieName,
          id: addic7edSeriesMapping[key].id,
          score: natural.DiceCoefficient(currentSerieName, serieName)
        }
      ];
    }, []).sort( (a, b) => b.score - a.score ); // sort by score

    if (serieIds.length == 0) {
      deferred.reject('no mathing series found on addic7ed...');
      return deferred.promise;
    }
    if (serieIds[0].score >= 0.8) {
      deferred.resolve(serieIds[0].id)
    } else {
      deferred.reject('no mathing series found on addic7ed...');
    }
  }

  return deferred.promise;
}

/**
 * Get all subs matching with parameters
 *
 *  @param {string} url
 *  @param {integer} episode
 *  @param {string} releaseGroup
 *
 *  @return {promise}
 */
export const getSubs = (url, episode, releaseGroup) => {
  let deferred = Q.defer();
  let subtitles = [];

  // Request to addic7ed
  request(url, (err, response, body) => {
    if (err) return deferred.reject('no mathing subtitles found on addic7ed...');

    if(!err && response.statusCode === 200) {

      // Load cheerio
      let $ = cheerio.load(body);

      // Addicted scrapped language name and id
      const addic7edLanguages = {};

      // Get languages by english fullname
      $('div#langs tbody tr').each( (index, row) => {
        const fullLanguageName = $($(row).find('td')[0]).text().trim();
        const id = $($($(row).find('td')[1]).find('input')).attr('id').trim().split('lang')[1];
        addic7edLanguages[fullLanguageName] = id;
      });

      // Loop over subtitles
      $('div#season tbody tr.epeven.completed').each((i, row) => {
        const columns = $(row).find('td');
        const releaseValid = compareReleaseGroup(releaseGroup, $(columns[4]).text());
        const isEpisode = (column, episode) => column.text() == String(episode);
        const percent = getStatus($(columns[5]).text());

        // Simple get the ISO-639-1 from english full language name
        const getLanguage = (id) => {
          return Object.keys(addic7edLanguagesMapping).reduce( (language, key) => {
            return addic7edLanguagesMapping[key] == id ? key : language;
          }, null);
        };

        if(isEpisode($(columns[1]), episode) && releaseValid) {
          if(percent >= 90) {
            subtitles.push({
              language: getLanguage(addic7edLanguages[$(columns[3]).text().trim()]),
              releaseGroup: $(columns[4]).text(),
              url: $(columns[9]).find('a').first().attr('href')
            });
          }
        }
      });

      deferred.resolve(subtitles);
    }
  });

  return deferred.promise;
}
