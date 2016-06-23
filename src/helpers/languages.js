import CountryLanguage from 'country-language';

class Languages {
  constructor() {
    this.languages = CountryLanguage.getLanguages();
    this.iso_code = [
      'iso639_1|ISO 639-1',
      'iso639_2en|ISO 639-2',
      'iso639_3|ISO 639-3',
    ];
  }

  /**
   * Set language code
   *
   *  @param {string} code
   */
  get(code) {
    this.code = code;
    this.currentIso = code.length > 2 ? 'iso639_2' : 'iso639_1';
    return this;
  }

  /**
   * Return the new format
   *
   *  @param {string} isoString | Iso code
   *  @return {string} iso code for the language
   */
  to(isoString) {
    const iso_code = this.iso_code.filter( code => code.split('|')[1] == isoString)[0].split('|')[0];

    if (!iso_code) {
      throw 'You should set a valid ISO - ISO 639-1 / ISO 639-2 / ISO 639-3';
    }

    const find = this.languages.filter( lang => {
      return lang[this.currentIso] == this.code;
    })[0];

    return find ? find[iso_code] : undefined;
  }
}


/**
 * Singleton Languages
 */
const LanguagesSingleton = (function () {
    let instance;

    const createInstance = () => {
      let object = new Languages();
      return object;
    }
    return !instance ? createInstance() : instance;
})();

export default LanguagesSingleton;
