import Api from '../Api';
import os from 'opensubtitles-api';
import Languages from '../../helpers/languages';

export default class OpenSubtitles extends Api {
  constructor(name='open-subtitles') {
    super(name);

    // Set opensubtitles-api instance
    this.os = new os('OSTestUserAgent');

    // Expected parameter for each type
    this.parameters = {
      serie: [ 'imdbId', 'fileName', 'filePath', 'season', 'episode' ],
      movie: [ 'imdbId', 'fileName', 'filePath' ]
    };
  }

  /**
   * Format correctly the languages to call OpenSubtitles
   *
   *  @param {array} languages
   *
   *  @return {string} formatted language
   */
  formatLanguages(languages) {
    if (!languages) {
      return 'all';
    }

    languages = languages
      .map( lang => Languages.get(lang).to('ISO 639-2'))
      .filter( lang => lang);

    return languages.length == 0 ? 'all' : (languages.length == 1 ? languages[0] : languages.join(','));
  }

  /**
   * Format a json from subtitles results
   *
   *  @param {Object} subtitles
   *
   *  @return {array} subtitles ordered
   */
  formatJson(subtitles) {
    return Object.keys(subtitles)
      .map( key => subtitles[key] )
      .map( sub => {
        return {
          type     : sub.url.substr(sub.url.lastIndexOf('.') + 1),
          language : sub.lang,
          rating   : sub.score,
          downloads: sub.downloads,
          url      : sub.url,
          api      : this.name
        };
      });
  }

  /**
   * Handle movies subtitles
   *
   *  @param {Object} file
   *  @param {array} languages
   */
  handleMovie(file, languages) {
    return this.os.search({
      sublanguageid: languages,
      imdbid: file.imdbId,
      filename: file.fileName,
      path: file.filePath
    })
    .then(subtitles => this.formatJson(subtitles))
  }

  /**
   * Handle serie subtitles
   *
   *  @param {Object} file
   *  @param {string} languages
   *
   *  @return {promise}
   */
  handleSerie(file, languages) {
    return this.os.search({
      sublanguageid: languages,
      imdbid       : file.imdbId,
      season       : file.season,
      episode      : file.episode,
      filename     : file.fileName,
      path         : file.filePath
    }).then(subtitles => this.formatJson(subtitles) );
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
    languages = this.formatLanguages(languages);
    return type == 'movie' ? this.handleMovie(file, languages) : this.handleSerie(file, languages);
  }
}
