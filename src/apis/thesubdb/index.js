import Api from '../Api';
import SubDb from 'subdb';
import Q from 'q';
import fs from 'fs';
import path from 'path';

export default class TheSubDb extends Api {
  constructor(name="thesubdb") {
    super(name);

    this.subDB = new SubDb();

    // Expected parameter for each type
    this.parameters = {
      serie: ['filePath'],
      movie: ['filePath']
    };
  }

  /**
   * Format a json from subtitles results
   *
   *  @param {Object} subtitles
   *
   *  @return {array} subtitles ordered
   */
  formatJson(subtitles) {
    return subtitles.map( language => {
      return {
        type     : 'srt',
        api      : this.name,
        language
      };
    });
  }


  /**
   * Deplace a file to an other directory
   *
   *  @param {string} source path
   *  @param {string} dest path
   *  @param {function} callback
   */
  deplace(from, to, cb) {
    const source = fs.createReadStream(from);
    const dest = fs.createWriteStream(to);
    source.pipe(dest);
    source.on('end', cb);
    source.on('error', cb);
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

    // temporary name to upload the first file
    const temp_name = (Math.floor(Math.random() * 100000) + 1)   + filename;
    const sourcePath = path.resolve(process.cwd(), temp_name);
    const destPath = path.resolve(directory, filename);

    // Download the subtitle form thesubdb
    this.subDB.api.download_subtitle(this.currentHash, subtitle.language, temp_name, (err, res) => {
      if(err) return deferred.reject(err);

      // Deplace the file to the right directory
      this.deplace(sourcePath, destPath, (err) => {
        if (err) return deferred.reject(err);

        // delete the temporary file
        fs.unlink(sourcePath);
        return deferred.resolve(destPath);
      })

      return deferred.resolve(res);
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
  handle(type, {filePath}, languages=[]) {
    const deferred = Q.defer();

    this.subDB.computeHash(filePath, (err, hash) => {
        if(err) return deferred.reject(err);
        this.currentHash = hash;
        this.subDB.api.search_subtitles(hash, (err, res) => {
          if(err) return deferred.reject(err);
          if (languages.length == 0) {
            return deferred.resolve(this.formatJson(res));
          }
          return deferred.resolve(this.formatJson(res.filter(lang => languages.indexOf(lang) != -1)));
        });
    });

    return deferred.promise;
  }
}
