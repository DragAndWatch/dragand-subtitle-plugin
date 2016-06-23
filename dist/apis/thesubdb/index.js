'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Api2 = require('../Api');

var _Api3 = _interopRequireDefault(_Api2);

var _subdb = require('subdb');

var _subdb2 = _interopRequireDefault(_subdb);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TheSubDb = function (_Api) {
  _inherits(TheSubDb, _Api);

  function TheSubDb() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "thesubdb" : arguments[0];

    _classCallCheck(this, TheSubDb);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TheSubDb).call(this, name));

    _this.subDB = new _subdb2.default();

    // Expected parameter for each type
    _this.parameters = {
      serie: ['filePath'],
      movie: ['filePath']
    };
    return _this;
  }

  /**
   * Format a json from subtitles results
   *
   *  @param {Object} subtitles
   *
   *  @return {array} subtitles ordered
   */


  _createClass(TheSubDb, [{
    key: 'formatJson',
    value: function formatJson(subtitles) {
      var _this2 = this;

      return subtitles.map(function (language) {
        return {
          type: 'srt',
          api: _this2.name,
          language: language
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

  }, {
    key: 'deplace',
    value: function deplace(from, to, cb) {
      var source = _fs2.default.createReadStream(from);
      var dest = _fs2.default.createWriteStream(to);
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

  }, {
    key: 'download',
    value: function download(subtitle, directory, filename) {
      var _this3 = this;

      var deferred = _q2.default.defer();

      // temporary name to upload the first file
      var temp_name = Math.floor(Math.random() * 100000) + 1 + filename;
      var sourcePath = _path2.default.resolve(process.cwd(), temp_name);
      var destPath = _path2.default.resolve(directory, filename);

      // Download the subtitle form thesubdb
      this.subDB.api.download_subtitle(this.currentHash, subtitle.language, temp_name, function (err, res) {
        if (err) return deferred.reject(err);

        // Deplace the file to the right directory
        _this3.deplace(sourcePath, destPath, function (err) {
          if (err) return deferred.reject(err);

          // delete the temporary file
          _fs2.default.unlink(sourcePath);
          return deferred.resolve(destPath);
        });

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

  }, {
    key: 'handle',
    value: function handle(type, _ref) {
      var _this4 = this;

      var filePath = _ref.filePath;
      var languages = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

      var deferred = _q2.default.defer();

      this.subDB.computeHash(filePath, function (err, hash) {
        if (err) return deferred.reject(err);
        _this4.currentHash = hash;
        _this4.subDB.api.search_subtitles(hash, function (err, res) {
          if (err) return deferred.reject(err);
          if (languages.length == 0) {
            return deferred.resolve(_this4.formatJson(res));
          }
          return deferred.resolve(_this4.formatJson(res.filter(function (lang) {
            return languages.indexOf(lang) != -1;
          })));
        });
      });

      return deferred.promise;
    }
  }]);

  return TheSubDb;
}(_Api3.default);

exports.default = TheSubDb;