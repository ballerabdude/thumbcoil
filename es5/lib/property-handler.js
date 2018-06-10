'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var propertyHandler = function propertyHandler(property) {
  var propertySplit = property.split('[');
  var propertyName = propertySplit[0];
  var indexArray = null;

  if (propertySplit.length > 1) {
    indexArray = propertySplit.slice(1).map(parseFloat);
  }

  return {
    propertyName: propertyName,
    indexArray: indexArray
  };
};
exports.propertyHandler = propertyHandler;