'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _Api2 = require('../Api');

var _Api3 = _interopRequireDefault(_Api2);

var _helper = require('./helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Addic7ed = function (_Api) {
  _inherits(Addic7ed, _Api);

  function Addic7ed() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? 'addic7ed' : arguments[0];

    _classCallCheck(this, Addic7ed);

    // Set accepted type

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Addic7ed).call(this, name));

    _this.acceptedType = ['serie'];

    _this.headers = {
      referer: 'http://www.addic7ed.com'
    };

    // Expected parameter for each type
    _this.parameters = {
      serie: ['title', 'episode', 'season', 'releaseGroup']
    };
    return _this;
  }

  /**
   * Be sure to scrappe addic7ed before get subtitles
   *
   *  @return {promise}
   */


  _createClass(Addic7ed, [{
    key: 'scrapping',
    value: function scrapping() {
      var _this2 = this;

      var deferred = _q2.default.defer();

      if (this._scrapping) {
        return deferred.resolve(this._scrapping);
      }

      (0, _helper.scrapper)(function (err, shows) {
        if (err) {
          return deferred.reject('fail to scrap addic7ed');
        }

        _this2._scrapping = shows;
        return deferred.resolve(_this2._scrapping);
      });

      return deferred.promise;
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
      var _this3 = this;

      return subtitles.map(function (sub) {
        sub.api = _this3.name;
        sub.url = 'http://addic7ed.com' + sub.url;
        return sub;
      });
    }

    /**
     * Format correctly the languages to call Addic7ed
     *
     *  @param {array} languages
     *
     *  @return {string} formatted language
     */

  }, {
    key: 'formatLanguages',
    value: function formatLanguages() {
      var languages = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      if (languages.length == 0) return null;
      return '|' + languages.map(function (lang) {
        return (0, _helper.mapping)(lang);
      }).join('|') + '|';
    }

    /**
     * Construct the right url to the api
     *
     *  @param {string} formatted languages
     *  @param {string} season
     *  @param {string} serieId
     *
     *  @return {string} formatted url
     */

  }, {
    key: 'constructUrl',
    value: function constructUrl(languages, season, serieId) {
      return 'http://addic7ed.com/ajax_loadShow.php?show=' + serieId + '&season=' + season + (!languages ? '' : '&langs=' + languages);
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
    value: function handle(type, _ref, languages) {
      var _this4 = this;

      var episode = _ref.episode;
      var releaseGroup = _ref.releaseGroup;
      var title = _ref.title;
      var season = _ref.season;

      var serieId = void 0;
      var languagesIds = this.formatLanguages(languages);

      return this.scrapping().then(function (results) {
        return (0, _helper.getSerieId)(results, title);
      }).then(function (id) {
        return (0, _helper.getSubs)(_this4.constructUrl(languagesIds, season, id), episode, releaseGroup);
      }).then(function (subs) {
        return _this4.formatJson(subs);
      });
    }
  }]);

  return Addic7ed;
}(_Api3.default);

exports.default = Addic7ed;