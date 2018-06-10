'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _expGolombString = require('./exp-golomb-string');

var _rbspUtils = require('./rbsp-utils');

var _mergeObj = require('./merge-obj');

var _list = require('./list');

var _propertyHandler3 = require('./property-handler');

var _propertyHelpers = require('./property-helpers');

/**
 * General ExpGolomb-Encoded-Structure Parse Functions
 */
var start = function start(name) {
  for (var _len = arguments.length, parseFns = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    parseFns[_key - 1] = arguments[_key];
  }

  var parseFn = (0, _list.list)(parseFns, true);

  return {
    decode: function decode(input, options, output) {
      var rawBitString = (0, _rbspUtils.typedArrayToBitString)(input);
      var bitString = rawBitString;

      options = options || {};
      output = output || {};

      if (!options.no_trailer_bits) {
        bitString = (0, _rbspUtils.removeRBSPTrailingBits)(rawBitString);
      }

      var expGolombDecoder = new _expGolombString.ExpGolombDecoder(bitString);

      try {
        return parseFn.decode({
          options: options,
          output: output,
          expGolomb: expGolombDecoder,
          indexes: [],
          path: [name]
        });
      } catch (e) {
        // Ensure that we always return `output` because we might have
        // successfully parsed something!
        return output;
      }
    },
    encode: function encode(input, options) {
      var expGolombEncoder = new _expGolombString.ExpGolombEncoder();

      options = options || {};

      parseFn.encode({
        options: options,
        input: input,
        expGolomb: expGolombEncoder,
        indexes: [],
        path: [name]
      });

      var output = expGolombEncoder.bitReservoir;
      var bitString = (0, _rbspUtils.appendRBSPTrailingBits)(output);
      var data = (0, _rbspUtils.bitStringToTypedArray)(bitString);

      return data;
    }
  };
};

exports.start = start;
var startArray = function startArray(name) {
  for (var _len2 = arguments.length, parseFns = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    parseFns[_key2 - 1] = arguments[_key2];
  }

  var startObj = start.apply(undefined, [name].concat(parseFns));

  return {
    decode: function decode(input, options) {
      return startObj.decode(input, options, []);
    },
    encode: startObj.encode
  };
};

exports.startArray = startArray;
var data = function data(name, dataType) {
  var _propertyHandler = (0, _propertyHandler3.propertyHandler)(name);

  var propertyName = _propertyHandler.propertyName;
  var indexArray = _propertyHandler.indexArray;

  return {
    name: name,
    decode: function decode(_ref) {
      var expGolomb = _ref.expGolomb;
      var output = _ref.output;
      var options = _ref.options;
      var indexes = _ref.indexes;
      var path = _ref.path;

      var value = undefined;

      try {
        value = dataType.read(expGolomb, output, options, indexes);
      } catch (e) {
        output['Parse Error:'] = e.message + ' at ' + path.join('/');
        throw e;
      }

      if (!indexArray) {
        output[propertyName] = value;
      } else {
        (0, _propertyHelpers.writeProperty)(output, options, propertyName, (0, _propertyHelpers.indexArrayMerge)(indexes, indexArray), value);
      }

      return output;
    },
    encode: function encode(_ref2) {
      var expGolomb = _ref2.expGolomb;
      var input = _ref2.input;
      var options = _ref2.options;
      var indexes = _ref2.indexes;
      var path = _ref2.path;

      var value = undefined;

      if (!indexArray) {
        value = input[propertyName];
      } else {
        value = (0, _propertyHelpers.getProperty)(input, options, propertyName, (0, _propertyHelpers.indexArrayMerge)(indexes, indexArray));
      }

      if (typeof value !== 'number') {
        return;
      }

      value = dataType.write(expGolomb, input, options, indexes, value);
    }
  };
};

exports.data = data;
var debug = function debug(prefix) {
  return {
    decode: function decode(_ref3) {
      var expGolomb = _ref3.expGolomb;
      var output = _ref3.output;
      var options = _ref3.options;
      var indexes = _ref3.indexes;
      var path = _ref3.path;

      console.log(prefix, path.join(','), expGolomb.bitReservoir, output, options, indexes);
    },
    encode: function encode(_ref4) {
      var expGolomb = _ref4.expGolomb;
      var input = _ref4.input;
      var options = _ref4.options;
      var indexes = _ref4.indexes;
      var path = _ref4.path;

      console.log(prefix, path.join(','), expGolomb.bitReservoir, input, options, indexes);
    }
  };
};

exports.debug = debug;
var newObj = function newObj(name) {
  for (var _len3 = arguments.length, parseFns = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    parseFns[_key3 - 1] = arguments[_key3];
  }

  var _propertyHandler2 = (0, _propertyHandler3.propertyHandler)(name);

  var propertyName = _propertyHandler2.propertyName;
  var indexArray = _propertyHandler2.indexArray;

  var parseFn = (0, _list.list)(parseFns, true);

  return {
    name: name,
    decode: function decode(_ref5) {
      var expGolomb = _ref5.expGolomb;
      var output = _ref5.output;
      var options = _ref5.options;
      var indexes = _ref5.indexes;
      var path = _ref5.path;

      var newPath = path.concat(name);
      var value = parseFn.decode({
        expGolomb: expGolomb,
        output: Object.create(output),
        options: options,
        indexes: indexes,
        path: newPath
      });

      if (!indexArray) {
        output[propertyName] = value;
      } else {
        (0, _propertyHelpers.writeProperty)(output, options, propertyName, (0, _propertyHelpers.indexArrayMerge)(indexes, indexArray), value);
      }

      return output;
    },
    encode: function encode(_ref6) {
      var expGolomb = _ref6.expGolomb;
      var input = _ref6.input;
      var options = _ref6.options;
      var indexes = _ref6.indexes;

      var value = undefined;

      if (!nameArray) {
        value = input[propertyName];
      } else {
        value = (0, _propertyHelpers.getProperty)(input, options, propertyName, (0, _propertyHelpers.indexArrayMerge)(indexes, indexArray));
      }

      if (typeof value !== 'number') {
        return;
      }

      var newPath = path.concat(name);
      parseFn.encode({
        expGolomb: expGolomb,
        input: value,
        options: options,
        indexes: indexes,
        path: newPath
      });
    }
  };
};

exports.newObj = newObj;
var verify = function verify(name) {
  return {
    decode: function decode(_ref7) {
      var expGolomb = _ref7.expGolomb;
      var output = _ref7.output;
      var options = _ref7.options;
      var indexes = _ref7.indexes;

      var len = expGolomb.bitReservoir.length;

      if (len !== 0) {
        output['Validation Error:'] = name + ' was not completely parsed - there were (' + len + ') bits remaining';
      }
    },
    encode: function encode(_ref8) {
      var expGolomb = _ref8.expGolomb;
      var input = _ref8.input;
      var options = _ref8.options;
      var indexes = _ref8.indexes;
    }
  };
};
exports.verify = verify;