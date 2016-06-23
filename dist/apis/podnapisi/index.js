'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Api2 = require('../Api');

var _Api3 = _interopRequireDefault(_Api2);

var _xml2json = require('xml2json');

var _xml2json2 = _interopRequireDefault(_xml2json);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Podnapisi = function (_Api) {
  _inherits(Podnapisi, _Api);

  function Podnapisi() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "podnapisi" : arguments[0];

    _classCallCheck(this, Podnapisi);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Podnapisi).call(this, name));

    _this.url = 'http://www.podnapisi.net/subtitles/search/old';

    // Expected parameter for each type
    _this.parameters = {
      'serie': ['title', 'episode', 'season'],
      'movie': ['title']
    };
    return _this;
  }

  /**
   * Construct the right url to call podnapisi api
   *
   *  @param {string} type | movie / serie
   *  @param {Object} file
   *  @param {array} languages
   *
   *  @return {string} url
   */


  _createClass(Podnapisi, [{
    key: 'constructUrl',
    value: function constructUrl(type, _ref, languages) {
      var title = _ref.title;
      var season = _ref.season;
      var episode = _ref.episode;

      if (type == 'serie') {
        return this.url + '?sL=' + languages.join(',') + '&sK=' + title + '&sTS=' + season + '&sTE=' + episode + '&sXML=1';
      }

      return this.url + '?sL=' + languages.join(',') + '&sK=' + title + '&sXML=1';
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

      return subtitles.map(function (sub) {
        return {
          type: 'zip',
          language: sub.language,
          releaseGroup: sub.release,
          rating: sub.rating,
          downloads: sub.downloads,
          url: sub.url + '/download',
          api: _this2.name
        };
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
      var _this3 = this;

      return (0, _requestPromise2.default)(this.constructUrl(type, file, languages)).then(function (body) {
        body = JSON.parse(_xml2json2.default.toJson(body));
        return _this3.formatJson(body.results.subtitle);
      });
    }
  }]);

  return Podnapisi;
}(_Api3.default);

exports.default = Podnapisi;