'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Api2 = require('../Api');

var _Api3 = _interopRequireDefault(_Api2);

var _yifySubs = require('yify-subs');

var _yifySubs2 = _interopRequireDefault(_yifySubs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Yifi = function (_Api) {
  _inherits(Yifi, _Api);

  function Yifi() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? 'yifi' : arguments[0];

    _classCallCheck(this, Yifi);

    // Set accepted type

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Yifi).call(this, name));

    _this.acceptedType = ['movie'];

    // Expected parameter for each type
    _this.parameters = {
      movie: ['imdbId']
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


  _createClass(Yifi, [{
    key: 'formatJson',
    value: function formatJson(results) {
      var _this2 = this;

      return Object.keys(results.subs).reduce(function (subtitles, key) {
        var subs = results.subs[key].map(function (subtitle) {
          var url = subtitle.url;
          var rating = subtitle.rating;

          return {
            type: 'zip',
            language: key,
            url: url,
            rating: rating,
            api: _this2.name
          };
        });
        return [].concat(_toConsumableArray(subtitles), _toConsumableArray(subs));
      }, []);
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
      var _this3 = this;

      var imdbId = _ref.imdbId;

      return _yifySubs2.default.getSubs(imdbId).then(function (data) {
        return languages.length == 0 ? _this3.formatJson(data) : _this3.formatJson(_yifySubs2.default.filter(data, languages));
      });
    }
  }]);

  return Yifi;
}(_Api3.default);

exports.default = Yifi;