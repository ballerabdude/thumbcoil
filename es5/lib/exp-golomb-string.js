/**
 * Tools for encoding and decoding ExpGolomb data from a bit-string
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var ExpGolombDecoder = function ExpGolombDecoder(bitString) {
  this.bitReservoir = bitString;
  this.originalBitReservoir = bitString;
};

exports.ExpGolombDecoder = ExpGolombDecoder;
ExpGolombDecoder.prototype.byteAlign = function () {
  var byteBoundary = Math.ceil((this.originalBitReservoir.length - this.bitReservoir.length) / 8) * 8;
  var bitsLeft = this.originalBitReservoir.length - byteBoundary;
  var bitsToRemove = this.bitReservoir.length - bitsLeft;

  return this.readRawBits(bitsToRemove);
};

ExpGolombDecoder.prototype.countLeadingZeros = function () {
  var i = 0;

  for (var _i = 0; _i < this.bitReservoir.length; _i++) {
    if (this.bitReservoir[_i] === '1') {
      return _i;
    }
  }

  return -1;
};

ExpGolombDecoder.prototype.readUnsignedExpGolomb = function () {
  var zeros = this.countLeadingZeros();
  var bitCount = zeros + 1;

  if (zeros === -1) {
    throw new Error('Error reading exp-golomb value.');
  }
  // Throw away the leading-zeros
  this.readBits(zeros);
  var val = this.readBits(bitCount);

  val -= 1;

  return val;
};

ExpGolombDecoder.prototype.readExpGolomb = function () {
  var val = this.readUnsignedExpGolomb();

  if (val !== 0) {
    if (val & 0x1) {
      val = (val + 1) / 2;
    } else {
      val = -(val / 2);
    }
  }

  return val;
};

ExpGolombDecoder.prototype.readBits = function (bitCount) {
  if (this.bitReservoir.length < bitCount) {
    throw new Error('Error reading bit stream value expected (' + bitCount + ') bits remaining but found (' + this.bitReservoir.length + ')');
  }

  var val = parseInt(this.bitReservoir.slice(0, bitCount), 2);

  this.bitReservoir = this.bitReservoir.slice(bitCount);

  return val;
};

ExpGolombDecoder.prototype.readRawBits = function (bitCount) {
  if (this.bitReservoir.length < bitCount) {
    throw new Error('Error reading bit stream value expected (' + bitCount + ') bits remaining but found (' + this.bitReservoir.length + ')');
  }

  var val = this.bitReservoir.slice(0, bitCount);

  this.bitReservoir = this.bitReservoir.slice(bitCount);

  return val;
};

ExpGolombDecoder.prototype.readUnsignedByte = function () {
  return this.readBits(8);
};

var ExpGolombEncoder = function ExpGolombEncoder(bitString) {
  this.bitReservoir = bitString || '';
};

exports.ExpGolombEncoder = ExpGolombEncoder;
ExpGolombEncoder.prototype.writeUnsignedExpGolomb = function (value) {
  var tempStr = '';
  var bitValue = (value + 1).toString(2);
  var numBits = bitValue.length - 1;

  for (var i = 0; i < numBits; i++) {
    tempStr += '0';
  }

  this.bitReservoir += tempStr + bitValue;
};

ExpGolombEncoder.prototype.writeExpGolomb = function (value) {
  if (value <= 0) {
    value = -value * 2;
  } else {
    value = value * 2 - 1;
  }

  this.writeUnsignedExpGolomb(value);
};

ExpGolombEncoder.prototype.writeBits = function (bitWidth, value) {
  var tempStr = '';
  var bitValue = (value & (1 << bitWidth) - 1).toString(2);
  var numBits = bitWidth - bitValue.length;

  for (var i = 0; i < numBits; i++) {
    tempStr += '0';
  }

  this.bitReservoir += tempStr + bitValue;
};

ExpGolombEncoder.prototype.writeRawBits = function (bitWidth, value) {
  var tempStr = '';
  var numBits = bitWidth - value.length;

  for (var i = 0; i < numBits; i++) {
    tempStr += '0';
  }

  this.bitReservoir += tempStr + value;
};

ExpGolombEncoder.prototype.writeUnsignedByte = function (value) {
  this.writeBits(8, value);
};