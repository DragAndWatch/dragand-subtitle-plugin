'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _countryLanguage = require('country-language');

var _countryLanguage2 = _interopRequireDefault(_countryLanguage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Languages = function () {
  function Languages() {
    _classCallCheck(this, Languages);

    this.languages = _countryLanguage2.default.getLanguages();
    this.iso_code = ['iso639_1|ISO 639-1', 'iso639_2en|ISO 639-2', 'iso639_3|ISO 639-3'];
  }

  /**
   * Set language code
   *
   *  @param {string} code
   */


  _createClass(Languages, [{
    key: 'get',
    value: function get(code) {
      this.code = code;
      this.currentIso = code.length > 2 ? 'iso639_2' : 'iso639_1';
      return this;
    }

    /**
     * Return the new format
     *
     *  @param {string} isoString | Iso code
     *  @return {string} iso code for the language
     */

  }, {
    key: 'to',
    value: function to(isoString) {
      var _this = this;

      var iso_code = this.iso_code.filter(function (code) {
        return code.split('|')[1] == isoString;
      })[0].split('|')[0];

      if (!iso_code) {
        throw 'You should set a valid ISO - ISO 639-1 / ISO 639-2 / ISO 639-3';
      }

      var find = this.languages.filter(function (lang) {
        return lang[_this.currentIso] == _this.code;
      })[0];

      return find ? find[iso_code] : undefined;
    }
  }]);

  return Languages;
}();

/**
 * Singleton Languages
 */


var LanguagesSingleton = function () {
  var instance = void 0;

  var createInstance = function createInstance() {
    var object = new Languages();
    return object;
  };
  return !instance ? createInstance() : instance;
}();

exports.default = LanguagesSingleton;