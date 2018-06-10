"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getProperty = function getProperty(obj, options, property, indexes) {
  var firstProperty = obj[property] || options[property];

  if (!indexes.length) {
    return firstProperty;
  }

  return indexes.reduce(function (finalProperty, index) {
    if (Array.isArray(finalProperty) || Object.isObject(finalProperty)) {
      return finalProperty[index];
    }
    return finalProperty;
  }, firstProperty);
};

exports.getProperty = getProperty;
var writeProperty = function writeProperty(obj, options, property, indexes, value) {
  var firstProperty = obj[property] || options[property];
  var lastIndex = indexes[indexes.length - 1];

  if (!firstProperty) {
    if (indexes.length) {
      firstProperty = obj[property] = [];
    } else {
      obj[property] = value;
      return;
    }
  }

  var target = indexes.slice(0, -1).reduce(function (finalProperty, index) {
    var newProperty = finalProperty[index];

    if (!Array.isArray(finalProperty[index])) {
      finalProperty[index] = [];
    }

    return finalProperty[index];
  }, firstProperty);

  target[lastIndex] = value;
};

exports.writeProperty = writeProperty;
var indexArrayMerge = function indexArrayMerge(indexesArray, propertyArray) {
  var newArray = indexesArray.slice(-propertyArray.length);

  return newArray.map(function (num, index) {
    if (isNaN(propertyArray[index])) {
      return num;
    } else {
      return propertyArray[index];
    }
  });
};
exports.indexArrayMerge = indexArrayMerge;