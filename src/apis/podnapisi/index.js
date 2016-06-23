import Api from '../Api';
import parser from 'xml2json';
import request from 'request-promise';

export default class Podnapisi extends Api {
  constructor(name="podnapisi") {
    super(name);

    this.url = 'http://www.podnapisi.net/subtitles/search/old';

    // Expected parameter for each type
    this.parameters = {
      'serie': ['title', 'episode', 'season'],
      'movie': ['title']
    };
  }

  /**
   * Construct the right url to call podnapisi api
   *
   *  @param {string} type | movie / serie
   *  @param {Object} file
   *  @param {array} languages
   *
   *  @return {string} url
   */
  constructUrl(type, {title, season, episode}, languages) {
    if (type == 'serie') {
      return `${this.url}?sL=${languages.join(',')}&sK=${title}&sTS=${season}&sTE=${episode}&sXML=1`;
    }

    return `${this.url}?sL=${languages.join(',')}&sK=${title}&sXML=1`;
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
      return {
        type        : 'zip',
        language    : sub.language,
        releaseGroup: sub.release,
        rating      : sub.rating,
        downloads   : sub.downloads,
        url         : sub.url + '/download',
        api         : this.name
      };
    });
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
  handle(type, file, languages) {
    return request(this.constructUrl(type, file, languages))
      .then( body => {
        body = JSON.parse(parser.toJson(body));
        return this.formatJson(body.results.subtitle);
      });
  }
}
