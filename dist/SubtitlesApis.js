'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _apis = require('./apis');

var _apis2 = _interopRequireDefault(_apis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SubitlesApis = function () {
  function SubitlesApis(apis) {
    _classCallCheck(this, SubitlesApis);

    this.apis = apis;
    this.types = ['movie', 'serie'];

    // Set this to have current api and type requested
    this.current = {
      apis: null,
      type: null
    };
  }

  /**
   * Get all Apis that match with the config and type
   *
   *  @param {string} type | type of
   *  @param {Array} requestedApis | requested apis
   *
   *  @return {SubitlesApis}
   */


  _createClass(SubitlesApis, [{
    key: 'for',
    value: function _for(type) {
      var requestedApis = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      if (this.types.indexOf(type) == -1) {
        throw 'You should specified a right type (movie or serie)';
      }

      if (requestedApis && !Array.isArray(requestedApis)) {
        throw 'You should specified your apis in an array';
      }

      // Set the current type
      this.current.type = type;

      // Get specific api from requestedApis and type
      this.current.apis = this.apis.filter(function (api) {
        return api.accept(type);
      }).filter(function (api) {
        if (requestedApis.length > 0) {
          return requestedApis.indexOf(api.name) != -1 ? true : false;
        }
        return true;
      });
      return this;
    }

    /**
     * Call all the current apis
     *
     *  @param {Object} file | file infos
     *  @param {array} languages | languages expected
     */

  }, {
    key: 'call',
    value: function call(file, languages) {
      var _this = this;

      if (!this.current.apis) {
        throw 'You have to choose your apis before';
      }

      // Create all promise for each api
      var promises = this.current.apis.filter(function (api) {
        return api.isValid(_this.current.type, file) && api.acceptLanguages(languages) ? true : false;
      }).map(function (api) {
        return api.handle(_this.current.type, file, languages);
      });

      // Use Q to get all promise even if the are rejected
      return _q2.default.allSettled(promises).then(function (results) {
        var promisesResults = results.reduce(function (final, promise) {
          if (promise.state === "fulfilled") {
            // Push subtitles
            final.subtitles = [].concat(_toConsumableArray(final.subtitles), _toConsumableArray(promise.value));
          } else {
            // Push errors
            final.errors = [].concat(_toConsumableArray(final.errors), _toConsumableArray(promise.reason));
          }
          return final;
        }, {
          errors: [],
          subtitles: []
        });

        // Format all subtitles by language
        promisesResults.subtitles = _this.formatByLanguage(promisesResults.subtitles);
        return promisesResults;
      });
    }

    /**
     * Format an array of subtitles by languages as key
     *
     *  @param {array} subtitles
     */

  }, {
    key: 'formatByLanguage',
    value: function formatByLanguage(subtitles) {
      return subtitles.reduce(function (obj, subtitle) {
        obj[subtitle.language] = obj[subtitle.language] || [];
        obj[subtitle.language].push(subtitle);
        return obj;
      }, {});
    }
  }]);

  return SubitlesApis;
}();

exports.default = new SubitlesApis(_apis2.default);