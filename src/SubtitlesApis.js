import Q from 'q';
import ApisArray from './apis';

class SubitlesApis {
  constructor(apis) {
    this.apis = apis;
    this.types = ['movie', 'serie'];

    // Set this to have current api and type requested
    this.current = {
      apis: null,
      type: null
    }
  }

  /**
   * Get all Apis that match with the config and type
   *
   *  @param {string} type | type of
   *  @param {Array} requestedApis | requested apis
   *
   *  @return {SubitlesApis}
   */
  for(type, requestedApis=[]) {
    if (this.types.indexOf(type) == -1) {
      throw 'You should specified a right type (movie or serie)';
    }

    if (requestedApis && !Array.isArray(requestedApis)) {
      throw 'You should specified your apis in an array';
    }

    // Set the current type
    this.current.type = type;

    // Get specific api from requestedApis and type
    this.current.apis = this.apis
      .filter( api => api.accept(type))
      .filter( api => {
        if (requestedApis.length > 0) {
          return requestedApis.indexOf(api.name) != -1 ? true : false;
        }
        return true;
      })
    return this;
  }

  /**
   * Call all the current apis
   *
   *  @param {Object} file | file infos
   *  @param {array} languages | languages expected
   */
  call(file, languages) {
    if (!this.current.apis) {
      throw 'You have to choose your apis before';
    }

    // Create all promise for each api
    let promises = this.current.apis
      .filter( api => {
        return api.isValid(this.current.type, file) && api.acceptLanguages(languages) ? true : false;
      })
      .map( api => api.handle(this.current.type, file, languages) );

    // Use Q to get all promise even if the are rejected
    return Q.allSettled(promises)
      .then( results => {
        const promisesResults = results.reduce( (final, promise) => {
          if (promise.state === "fulfilled") {
            // Push subtitles
            final.subtitles = [...final.subtitles, ...promise.value];
          } else {
            // Push errors
            final.errors = [...final.errors, ...promise.reason];
          }
          return final;
        }, {
          errors: [],
          subtitles: []
        });

        // Format all subtitles by language
        promisesResults.subtitles = this.formatByLanguage(promisesResults.subtitles);
        return promisesResults;
      });
  }

  /**
   * Format an array of subtitles by languages as key
   *
   *  @param {array} subtitles
   */
  formatByLanguage(subtitles) {
    return subtitles
      .reduce( (obj, subtitle) => {
        obj[subtitle.language] = obj[subtitle.language] || [];
        obj[subtitle.language].push(subtitle);
        return obj;
      }, {});
  }
}

export default new SubitlesApis(ApisArray);
