'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Api2 = require('../Api');

var _Api3 = _interopRequireDefault(_Api2);

var _opensubtitlesApi = require('opensubtitles-api');

var _opensubtitlesApi2 = _interopRequireDefault(_opensubtitlesApi);

var _languages = require('../../helpers/languages');

var _languages2 = _interopRequireDefault(_languages);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OpenSubtitles = function (_Api) {
  _inherits(OpenSubtitles, _Api);

  function OpenSubtitles() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? 'open-subtitles' : arguments[0];

    _classCallCheck(this, OpenSubtitles);

    // Set opensubtitles-api instance

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(OpenSubtitles).call(this, name));

    _this.os = new _opensubtitlesApi2.default('OSTestUserAgent');

    // Expected parameter for each type
    _this.parameters = {
      serie: ['imdbId', 'fileName', 'filePath', 'season', 'episode'],
      movie: ['imdbId', 'fileName', 'filePath']
    };
    return _this;
  }

  /**
   * Format correctly the languages to call OpenSubtitles
   *
   *  @param {array} languages
   *
   *  @return {string} formatted language
   */


  _createClass(OpenSubtitles, [{
    key: 'formatLanguages',
    value: function formatLanguages(languages) {
      if (!languages) {
        return 'all';
      }

      languages = languages.map(function (lang) {
        return _languages2.default.get(lang).to('ISO 639-2');
      }).filter(function (lang) {
        return lang;
      });

      return languages.length == 0 ? 'all' : languages.length == 1 ? languages[0] : languages.join(',');
    }

    /**
     * Format a json from subtitles results
     *
     *  @param {Object} subtitles
     *
     *  @return {array} subtitles ordered
     */

  }, {
    key: 'formatJson',
    value: function formatJson(subtitles) {
      var _this2 = this;

      return Object.keys(subtitles).map(function (key) {
        return subtitles[key];
      }).map(function (sub) {
        return {
          type: sub.url.substr(sub.url.lastIndexOf('.') + 1),
          language: sub.lang,
          rating: sub.score,
          downloads: sub.downloads,
          url: sub.url,
          api: _this2.name
        };
      });
    }

    /**
     * Handle movies subtitles
     *
     *  @param {Object} file
     *  @param {array} languages
     */

  }, {
    key: 'handleMovie',
    value: function handleMovie(file, languages) {
      var _this3 = this;

      return this.os.search({
        sublanguageid: languages,
        imdbid: file.imdbId,
        filename: file.fileName,
        path: file.filePath
      }).then(function (subtitles) {
        return _this3.formatJson(subtitles);
      });
    }

    /**
     * Handle serie subtitles
     *
     *  @param {Object} file
     *  @param {string} languages
     *
     *  @return {promise}
     */

  }, {
    key: 'handleSerie',
    value: function handleSerie(file, languages) {
      var _this4 = this;

      return this.os.search({
        sublanguageid: languages,
        imdbid: file.imdbId,
        season: file.season,
        episode: file.episode,
        filename: file.fileName,
        path: file.filePath
      }).then(function (subtitles) {
        return _this4.formatJson(subtitles);
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
    value: function handle(type, file, languages) {
      languages = this.formatLanguages(languages);
      return type == 'movie' ? this.handleMovie(file, languages) : this.handleSerie(file, languages);
    }
  }]);

  return OpenSubtitles;
}(_Api3.default);

exports.default = OpenSubtitles;