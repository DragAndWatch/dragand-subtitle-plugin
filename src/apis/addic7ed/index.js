import Q from 'q';
import Api from '../Api';
import {mapping, scrapper, getStatus, compareReleaseGroup, getSerieId, getSubs} from './helper';

export default class Addic7ed extends Api {
  constructor(name='addic7ed') {
    super(name);

    // Set accepted type
    this.acceptedType = ['serie'];

    this.headers = {
      referer: 'http://www.addic7ed.com'
    }

    // Expected parameter for each type
    this.parameters = {
      serie: ['title', 'episode', 'season', 'releaseGroup' ]
    };
  }

  /**
   * Be sure to scrappe addic7ed before get subtitles
   *
   *  @return {promise}
   */
  scrapping() {
    let deferred = Q.defer();

    if (this._scrapping) {
      return deferred.resolve(this._scrapping);
    }

    scrapper( (err, shows) => {
      if (err) {
        return deferred.reject('fail to scrap addic7ed');
      }

      this._scrapping = shows;
      return deferred.resolve(this._scrapping);
    });

    return deferred.promise;
  }

  /**
   * Format a json from subtitles results
   *
   *  @param {Object} subtitles
   *
   *  @return {array} subtitles ordered
   */
  formatJson(subtitles) {
    return subtitles.map( sub => {
      sub.api = this.name;
      sub.url = `http://addic7ed.com${sub.url}`;
      return sub;
    })
  }

  /**
   * Format correctly the languages to call Addic7ed
   *
   *  @param {array} languages
   *
   *  @return {string} formatted language
   */
  formatLanguages(languages=[]) {
    if (languages.length == 0) return null;
    return '|' + languages.map( lang => mapping(lang)).join('|') + '|';
  }

  /**
   * Construct the right url to the api
   *
   *  @param {string} formatted languages
   *  @param {string} season
   *  @param {string} serieId
   *
   *  @return {string} formatted url
   */
  constructUrl(languages, season, serieId) {
    return `http://addic7ed.com/ajax_loadShow.php?show=${serieId}&season=${season}${!languages ? '' : '&langs=' + languages}`
  }

  /**
   * Handle api call
   *
   *  @param {string} type | movie / serie
   *  @param {Object} file
   *  @param {array} languages
   *
   *  @return {Promise} subtitles
   */
  handle(type, {episode, releaseGroup, title, season}, languages) {
    let serieId;
    const languagesIds = this.formatLanguages(languages);

    return this.scrapping()
      .then( results => getSerieId(results, title) )
      .then( id => getSubs(this.constructUrl(languagesIds, season, id), episode, releaseGroup))
      .then( subs => this.formatJson(subs) );
  }
}
