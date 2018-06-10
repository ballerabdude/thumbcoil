'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _list = require('./list');

var _propertyHandler4 = require('./property-handler');

var _propertyHelpers = require('./property-helpers');

var when = function when(conditionFn) {
  for (var _len = arguments.length, parseFns = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    parseFns[_key - 1] = arguments[_key];
  }

  var parseFn = (0, _list.list)(parseFns, true);

  return {
    decode: function decode(_ref) {
      var expGolomb = _ref.expGolomb;
      var output = _ref.output;
      var options = _ref.options;
      var indexes = _ref.indexes;
      var path = _ref.path;

      var newPath = path.concat('[when]');

      if (conditionFn(output, options, indexes)) {
        return parseFn.decode({
          expGolomb: expGolomb,
          output: output,
          options: options,
          indexes: indexes,
          path: newPath
        });
      }

      return output;
    },
    encode: function encode(_ref2) {
      var expGolomb = _ref2.expGolomb;
      var input = _ref2.input;
      var options = _ref2.options;
      var indexes = _ref2.indexes;
      var path = _ref2.path;

      var newPath = path.concat('[when]');

      if (conditionFn(input, options, indexes)) {
        parseFn.encode({
          expGolomb: expGolomb,
          input: input,
          options: options,
          indexes: indexes,
          path: newPath
        });
      }
    }
  };
};

exports.when = when;
var each = function each(conditionFn) {
  for (var _len2 = arguments.length, parseFns = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    parseFns[_key2 - 1] = arguments[_key2];
  }

  var parseFn = (0, _list.list)(parseFns, true);

  return {
    decode: function decode(_ref3) {
      var expGolomb = _ref3.expGolomb;
      var output = _ref3.output;
      var options = _ref3.options;
      var indexes = _ref3.indexes;
      var path = _ref3.path;

      var newPath = path.concat('[each]');
      var indexSlot = indexes.length;

      // Add a new index slot for this loop
      indexes[indexSlot] = 0;

      while (conditionFn(indexes[indexSlot], output, options)) {
        parseFn.decode({
          expGolomb: expGolomb,
          output: output,
          options: options,
          indexes: indexes,
          path: newPath
        });
        indexes[indexSlot]++;
      }
      // Remove the index slot from the list of indexes
      indexes.length = indexSlot;

      return output;
    },
    encode: function encode(_ref4) {
      var expGolomb = _ref4.expGolomb;
      var input = _ref4.input;
      var options = _ref4.options;
      var indexes = _ref4.indexes;
      var path = _ref4.path;

      var newPath = path.concat('[each]');
      var indexSlot = indexes.length;

      // Add a new index slot for this loop
      indexes[indexSlot] = 0;

      while (conditionFn(indexes[indexSlot], input, options)) {
        parseFn.encode({
          expGolomb: expGolomb,
          input: input,
          options: options,
          indexes: indexes,
          path: newPath
        });
        indexes[indexSlot]++;
      }
      // Remove the index slot from the list of indexes
      indexes.length = indexSlot;
    }
  };
};

exports.each = each;
var inArray = function inArray(name, array) {
  var _propertyHandler = (0, _propertyHandler4.propertyHandler)(name);

  var propertyName = _propertyHandler.propertyName;
  var indexArray = _propertyHandler.indexArray;

  return function (obj, options, indexes) {
    if (indexArray) {
      return array.indexOf((0, _propertyHelpers.getProperty)(obj, options, propertyName, (0, _propertyHelpers.indexArrayMerge)(indexes, indexArray))) !== -1;
    } else {
      return array.indexOf(obj[propertyName]) !== -1 || array.indexOf(options[propertyName]) !== -1;
    }
  };
};

exports.inArray = inArray;
var equals = function equals(name, value) {
  var _propertyHandler2 = (0, _propertyHandler4.propertyHandler)(name);

  var propertyName = _propertyHandler2.propertyName;
  var indexArray = _propertyHandler2.indexArray;

  return function (obj, options, indexes) {
    if (indexArray) {
      return (0, _propertyHelpers.getProperty)(obj, options, propertyName, (0, _propertyHelpers.indexArrayMerge)(indexes, indexArray)) === value;
    } else {
      return obj[propertyName] === value || options[propertyName] === value;
    }
  };
};

exports.equals = equals;
var gt = function gt(name, value) {
  var _propertyHandler3 = (0, _propertyHandler4.propertyHandler)(name);

  var propertyName = _propertyHandler3.propertyName;
  var indexArray = _propertyHandler3.indexArray;

  return function (obj, options, indexes) {
    if (indexArray) {
      return (0, _propertyHelpers.getProperty)(obj, options, propertyName, (0, _propertyHelpers.indexArrayMerge)(indexes, indexArray)) === value;
    } else {
      return obj[propertyName] > value || options[propertyName] > value;
    }
  };
};

exports.gt = gt;
var not = function not(fn) {
  return function (obj, options, indexes) {
    return !fn(obj, options, indexes);
  };
};

exports.not = not;
var some = function some(conditionFns) {
  return function (obj, options, indexes) {
    return conditionFns.some(function (fn) {
      return fn(obj, options, indexes);
    });
  };
};

exports.some = some;
var every = function every(conditionFns) {
  return function (obj, options, indexes) {
    return conditionFns.every(function (fn) {
      return fn(obj, options, indexes);
    });
  };
};

exports.every = every;
var whenMoreData = function whenMoreData() {
  for (var _len3 = arguments.length, parseFns = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    parseFns[_key3] = arguments[_key3];
  }

  var parseFn = (0, _list.list)(parseFns, true);

  return {
    decode: function decode(_ref5) {
      var expGolomb = _ref5.expGolomb;
      var output = _ref5.output;
      var options = _ref5.options;
      var indexes = _ref5.indexes;
      var path = _ref5.path;

      var newPath = path.concat('[whenMoreData]');

      if (expGolomb.bitReservoir.length) {
        return parseFn.decode({
          expGolomb: expGolomb,
          output: output,
          options: options,
          indexes: indexes,
          path: newPath
        });
      }
      return output;
    },
    encode: function encode(_ref6) {
      var expGolomb = _ref6.expGolomb;
      var input = _ref6.input;
      var options = _ref6.options;
      var indexes = _ref6.indexes;
      var path = _ref6.path;

      var newPath = path.concat('[whenMoreData]');

      parseFn.encode({
        expGolomb: expGolomb,
        input: input,
        options: options,
        indexes: indexes,
        path: newPath
      });
    }
  };
};

exports.whenMoreData = whenMoreData;
var whileMoreData = function whileMoreData() {
  for (var _len4 = arguments.length, parseFns = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    parseFns[_key4] = arguments[_key4];
  }

  var parseFn = (0, _list.list)(parseFns, true);

  return {
    decode: function decode(_ref7) {
      var expGolomb = _ref7.expGolomb;
      var output = _ref7.output;
      var options = _ref7.options;
      var indexes = _ref7.indexes;
      var path = _ref7.path;

      var newPath = path.concat('[whileMoreData]');
      var indexSlot = indexes.length;

      // Add a new index slot for this loop
      indexes[indexSlot] = 0;

      while (expGolomb.bitReservoir.length) {
        parseFn.decode({
          expGolomb: expGolomb,
          output: output,
          options: options,
          indexes: indexes,
          path: newPath
        });
        indexes[indexSlot]++;
      }
      // Remove the index slot from the list of indexes
      indexes.length = indexSlot;

      return output;
    },
    encode: function encode(_ref8) {
      var expGolomb = _ref8.expGolomb;
      var input = _ref8.input;
      var options = _ref8.options;
      var indexes = _ref8.indexes;
      var path = _ref8.path;

      var newPath = path.concat('[whenMoreData]');
      var indexSlot = indexes.length;

      // Add a new index slot for this loop
      indexes[indexSlot] = 0;

      var length = 0;

      if (Array.isArray(input)) {
        length = input.length;
      }

      while (index < length) {
        parseFn.encode({
          expGolomb: expGolomb,
          input: input,
          options: options,
          indexes: indexes,
          path: newPath
        });
        indexes[indexSlot]++;
      }
      // Remove the index slot from the list of indexes
      indexes.length = indexSlot;
    }
  };
};
exports.whileMoreData = whileMoreData;