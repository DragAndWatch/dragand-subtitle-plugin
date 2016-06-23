import SubtitlesApis from './SubtitlesApis';

class DragandSubtitles {
  constructor() {
    this.config = {
      languages: [],
      apis: []
    };
  }

  /**
   * Get an array of all api name
   *
   *  @return {array} apis names
   */
  apis() {
    return SubtitlesApis.apis.map( api => api.name);
  }

  /**
   * Get an api by its name
   *
   *  @param {string} name | api name
   *
   *  @return {Object} Api
   */
  api(name) {
    const api = SubtitlesApis.apis.filter( api => api.name === name);
    return api ? api[0] : undefined;
  }

  /**
   * Download the subtitle file in a specific directory
   *
   *  @param {Object} subtitle
   *  @param {string} directory
   *  @param {string} fileName
   *  @param {boolean} add language at the end of the filename
   *
   *  @return {promise} filepath
   */
  download(subtitle, directory, filename, addLanguage=true) {
    filename = `${/(.*)\.[^.]+$/.exec(filename)[1]}${addLanguage ? '.' + subtitle.language : ''}.srt`;
    return this.api(subtitle.api).download(subtitle, directory, filename);
  }


  /**
   * Get all subtitles classed by languages for a fileName
   *
   *  @param {string} type (movie/serie)
   *  @param {Object} file
   *  @param {array} languages
   *  @param {array} apis requested
   */
  getSubtitles(type, file, languages=null, apis=null) {
    languages = languages || this.config.languages;
    apis = apis || this.config.languages;

    if (!Array.isArray(languages)) {
      throw "You should set your languages as an array";
    }

    if (!Array.isArray(apis)) {
      throw "You should APIS should be an array";
    }

    if (typeof type !== 'string') {
      throw 'Type should be a string';
    }

    return SubtitlesApis.for(type, apis).call(file, languages);
  }
}


/**
 * Plugin Singleton
 */
const PluginSingleton = (function () {
    let instance;

    const createInstance = () => {
      let object = new DragandSubtitles();
      return object;
    }

    return !instance ? createInstance() : instance;
})();

export default PluginSingleton;
