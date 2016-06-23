'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SubtitlesApis = require('./SubtitlesApis');

var _SubtitlesApis2 = _interopRequireDefault(_SubtitlesApis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DragandSubtitles = function () {
  function DragandSubtitles() {
    _classCallCheck(this, DragandSubtitles);

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


  _createClass(DragandSubtitles, [{
    key: 'apis',
    value: function apis() {
      return _SubtitlesApis2.default.apis.map(function (api) {
        return api.name;
      });
    }

    /**
     * Get an api by its name
     *
     *  @param {string} name | api name
     *
     *  @return {Object} Api
     */

  }, {
    key: 'api',
    value: function api(name) {
      var api = _SubtitlesApis2.default.apis.filter(function (api) {
        return api.name === name;
      });
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

  }, {
    key: 'download',
    value: function download(subtitle, directory, filename) {
      var addLanguage = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

      filename = '' + /(.*)\.[^.]+$/.exec(filename)[1] + (addLanguage ? '.' + subtitle.language : '') + '.srt';
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

  }, {
    key: 'getSubtitles',
    value: function getSubtitles(type, file) {
      var languages = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
      var apis = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

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

      return _SubtitlesApis2.default.for(type, apis).call(file, languages);
    }
  }]);

  return DragandSubtitles;
}();

/**
 * Plugin Singleton
 */


var PluginSingleton = function () {
  var instance = void 0;

  var createInstance = function createInstance() {
    var object = new DragandSubtitles();
    return object;
  };

  return !instance ? createInstance() : instance;
}();

exports.default = PluginSingleton;