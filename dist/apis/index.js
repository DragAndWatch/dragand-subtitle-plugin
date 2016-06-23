'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _opensubtitles = require('./opensubtitles/');

var _opensubtitles2 = _interopRequireDefault(_opensubtitles);

var _yifi = require('./yifi/');

var _yifi2 = _interopRequireDefault(_yifi);

var _podnapisi = require('./podnapisi/');

var _podnapisi2 = _interopRequireDefault(_podnapisi);

var _thesubdb = require('./thesubdb/');

var _thesubdb2 = _interopRequireDefault(_thesubdb);

var _addic7ed = require('./addic7ed/');

var _addic7ed2 = _interopRequireDefault(_addic7ed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = [new _opensubtitles2.default(), new _yifi2.default(), new _podnapisi2.default(), new _thesubdb2.default(), new _addic7ed2.default()];