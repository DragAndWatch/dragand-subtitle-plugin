'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _download2 = require('download');

var _download3 = _interopRequireDefault(_download2);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _languages = require('../helpers/languages');

var _languages2 = _interopRequireDefault(_languages);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Api = function () {
  function Api(name) {
    _classCallCheck(this, Api);

    this.acceptedType = ['movie', 'serie'];
    this.name = name;
    this.headers = {};
    this.parameters = {
      serie: [],
      movie: []
    };
  }

  /**
   * Check if the api accept the type (movie/serie)
   *
   *  @param {string} type
   *
   *  @return {boolean}
   */


  _createClass(Api, [{
    key: 'accept',
    value: function accept(type) {
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

  }, {
    key: 'isValid',
    value: function isValid(type, file) {
      if (type != 'movie' && type != 'serie') {
        throw 'You should use movie or serie as type';
      }

      var params = null;
      var expectedParameters = this.parameters[type];

      Object.keys(file).forEach(function (key) {
        params = params ? params.filter(function (param) {
          return param != key;
        }) : expectedParameters.filter(function (param) {
          return param != key;
        });
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

  }, {
    key: 'download',
    value: function download(subtitle, directory, filename) {
      var deferred = _q2.default.defer();

      new _download3.default({ mode: '755', extract: true, headers: this.headers }).get(subtitle.url).dest(directory).rename(filename).run(function (err, files) {
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

  }, {
    key: 'acceptLanguages',
    value: function acceptLanguages() {
      var languages = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      return true;
    }
  }]);

  return Api;
}();

exports.default = Api;