'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var list = function list(parseFns, silent) {
  return {
    decode: function decode(_ref) {
      var expGolomb = _ref.expGolomb;
      var output = _ref.output;
      var options = _ref.options;
      var indexes = _ref.indexes;
      var path = _ref.path;

      var newPath = silent ? path : path.concat('[list]');

      parseFns.forEach(function (fn) {
        output = fn.decode({
          expGolomb: expGolomb,
          output: output,
          options: options,
          indexes: indexes,
          path: newPath
        }) || output;
      });

      return output;
    },
    encode: function encode(expGolomb, input, options, index) {
      parseFns.forEach(function (fn) {
        fn.encode(expGolomb, input, options, index);
      });
    }
  };
};
exports.list = list;