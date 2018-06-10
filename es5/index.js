'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bitStreamsH264 = require('./bit-streams/h264');

var _bitStreamsH2642 = _interopRequireDefault(_bitStreamsH264);

var _inspectors = require('./inspectors');

var _validatorsContainer = require('./validators/container');

var thumbCoil = {
  h264Codecs: _bitStreamsH2642['default'],
  mp4Inspector: _inspectors.mp4Inspector,
  tsInspector: _inspectors.tsInspector,
  flvInspector: _inspectors.flvInspector,
  validateContainers: _validatorsContainer.validateContainers
};

// Include the version number.
thumbCoil.VERSION = '__VERSION__';

exports['default'] = thumbCoil;
module.exports = exports['default'];