import download from 'download';
import Q from 'q';
import Languages from '../helpers/languages';

export default class Api {
  constructor(name) {
    this.acceptedType = ['movie', 'serie'];
    this.name = name;
    this.headers = {};
    this.parameters = {
      serie: [],
      movie: []
    }
  }

  /**
   * Check if the api accept the type (movie/serie)
   *
   *  @param {string} type
   *
   *  @return {boolean}
   */
  accept(type) {
    return this.acceptedType.indexOf(type) != -1;
  }

  /**
   * Check if the file config has all expected parameters
   *
   *  @param {Object} file
   *  @param {string} type
   *
   *  @return {boolean}
   */
  isValid(type, file) {
    if (type != 'movie' && type != 'serie') {
      throw 'You should use movie or serie as type';
    }

    let params = null;
    const expectedParameters = this.parameters[type];

    Object.keys(file).forEach( key => {
      params = params ? params.filter( param => param != key) : expectedParameters.filter( param => param != key)
    });

    return params.length > 0 ? false : true;
  }

  /**
   * Download the subtitle file in a specific directory
   *
   *  @param {Object} subtitle
   *  @param {string} directory
   *  @param {string} fileName
   *
   *  @return {promise} filepath
   */
  download(subtitle, directory, filename) {
    const deferred = Q.defer();

    new download({mode: '755', extract: true, headers: this.headers})
      .get(subtitle.url)
      .dest(directory)
      .rename(filename)
      .run( (err, files) => {
        return err ? deferred.reject(err) : deferred.resolve(files[0].path);
      });

    return deferred.promise;
  }

  /**
   * Check if the api accept the languages
   * By default all accept
   *
   *  @param {array} languages
   *
   *  @return {boolean}
   */
  acceptLanguages(languages=[]) {
    return true;
  }
}
