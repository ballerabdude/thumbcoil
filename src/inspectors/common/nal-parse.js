import {
  discardEmulationPrevention,
  picParameterSet,
  seqParameterSet,
  sliceLayerWithoutPartitioning,
  accessUnitDelimiter,
  supplementalEnhancementInformation
} from '../../bit-streams/h264';

let lastSPS;
let lastPPS;
let lastOptions;

export const mergePS = function (a, b) {
  var newObj = {};

  if (a) {
    Object.keys(a).forEach(function (key) {
      newObj[key] = a[key];
    });
  }

  if (b) {
    Object.keys(b).forEach(function (key) {
      newObj[key] = b[key];
    });
  }

  return newObj;
};

export const nalParseAVCC = function (avcStream) {
  var
    avcView = new DataView(avcStream.buffer, avcStream.byteOffset, avcStream.byteLength),
    result = [],
    nalData,
    i,
    length;

  for (i = 0; i + 4 < avcStream.length; i += length) {
    length = avcView.getUint32(i);
    i += 4;

    // bail if this doesn't appear to be an H264 stream
    if (length <= 0) {
      result.push({
        type: 'MALFORMED-DATA'
      });
      continue;
    }
    if (length > avcStream.length) {
      result.push({
        type: 'UNKNOWN MDAT DATA'
      });
      return;
    }

    let nalUnit = avcStream.subarray(i, i + length);

    result.push(nalParse(nalUnit));
  }

  return result;
};

export const nalParseAnnexB = function (buffer) {
  let syncPoint = 0;
  let i;
  let result = [];

  // Rec. ITU-T H.264, Annex B
  // scan for NAL unit boundaries

  // a match looks like this:
  // 0 0 1 .. NAL .. 0 0 1
  // ^ sync point        ^ i
  // or this:
  // 0 0 1 .. NAL .. 0 0 0
  // ^ sync point        ^ i

  // advance the sync point to a NAL start, if necessary
  for (; syncPoint < buffer.byteLength - 3; syncPoint++) {
    if (buffer[syncPoint] === 0 &&
      buffer[syncPoint + 1] === 0 &&
      buffer[syncPoint + 2] === 1) {
      // the sync point is properly aligned
      i = syncPoint + 5;
      break;
    }
  }

  while (i < buffer.byteLength) {
    if (syncPoint === undefined) {
      debugger;
    }
    // look at the current byte to determine if we've hit the end of
    // a NAL unit boundary
    switch (buffer[i]) {
    case 0:
      // skip past non-sync sequences
      if (buffer[i - 1] !== 0) {
        i += 2;
        break;
      } else if (buffer[i - 2] !== 0) {
        i++;
        break;
      }

      // deliver the NAL unit if it isn't empty
      if (syncPoint + 3 !== i - 2) {
        result.push(nalParse(buffer.subarray(syncPoint + 3, i - 2)));
      }

      // drop trailing zeroes
      do {
        i++;
      } while (buffer[i] !== 1 && i < buffer.length);
      syncPoint = i - 2;
      i += 3;
      break;
    case 1:
      // skip past non-sync sequences
      if (buffer[i - 1] !== 0 ||
          buffer[i - 2] !== 0) {
        i += 3;
        break;
      }

      // deliver the NAL unit
      result.push(nalParse(buffer.subarray(syncPoint + 3, i - 2)));
      syncPoint = i - 2;
      i += 3;
      break;
    default:
      // the current byte isn't a one or zero, so it cannot be part
      // of a sync sequence
      i += 3;
      break;
    }
  }
  // filter out the NAL units that were delivered
  buffer = buffer.subarray(syncPoint);
  i -= syncPoint;
  syncPoint = 0;

  // deliver the last buffered NAL unit
  if (buffer && buffer.byteLength > 3) {
    result.push(nalParse(buffer.subarray(syncPoint + 3)));
  }

  return result;
};

const nalParse = function (nalUnit) {
  let nalData;

  if (nalUnit.length > 1) {
    nalData = discardEmulationPrevention(nalUnit.subarray(1));
  } else {
    nalData = nalUnit;
  }

  let nalUnitType = (nalUnit[0] & 0x1F);
  let nalRefIdc = (nalUnit[0] & 0x60) >>> 5;

  if (lastOptions) {
    lastOptions.nal_unit_type = nalUnitType;
    lastOptions.nal_ref_idc = nalRefIdc;
  }
  let nalObject;
  let newOptions;

  switch (nalUnitType) {
    case 0x06:
      nalObject = supplementalEnhancementInformation.decode(nalData, lastOptions);
      nalObject.type = 'sei_message_rbsp';
      nalObject.size = nalData.length;
      return nalObject;
    default:
      return {
        type: 'INVALID NAL-UNIT-TYPE - ' + nalUnitType,
        size: nalData.length
      };
  }
};
