import Api from '../Api';
import YFsubs from 'yify-subs';

export default class Yifi extends Api {
  constructor(name='yifi') {
    super(name);

    // Set accepted type
    this.acceptedType = ['movie'];

    // Expected parameter for each type
    this.parameters = {
      movie: ['imdbId']
    };
  }

  /**
   * Format a json from subtitles results
   *
   *  @param {Object} subtitles
   *
   *  @return {array} subtitles ordered
   */
  formatJson(results) {
    return Object.keys(results.subs).reduce( (subtitles, key) => {
      const subs = results.subs[key].map( subtitle => {
        const { url, rating } = subtitle;
        return {
          type: 'zip',
          language: key,
          url,
          rating,
          api: this.name
        };
      });
      return [...subtitles, ...subs];
    }, []);
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
  handle(type, {imdbId}, languages) {
    return YFsubs.getSubs(imdbId).then( data => {
      return languages.length == 0 ? this.formatJson(data) : this.formatJson(YFsubs.filter(data, languages));
    })
  }
}
