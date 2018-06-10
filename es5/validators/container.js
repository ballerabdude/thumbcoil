'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var isIFrame = function isIFrame(frame) {
  if (!frame.nals) {
    return false;
  }

  // nal_unit_type of 5 is a coded slice of an IDR (instantaneous decoding refresh)
  // picture
  if (frame.nals.find(function (nal) {
    return nal.nal_unit_type === 5;
  })) {
    return true;
  }

  // slice_layer_without_partitioning_rbsp_idr is an IDR variant of
  // slice_layer_without_partitioning_rbsp
  if (frame.nals.find(function (nal) {
    return nal.type === 'slice_layer_without_partitioning_rbsp_idr';
  })) {
    return true;
  }

  var seiMessage = frame.nals.find(function (nal) {
    return nal.type === 'sei_message';
  });

  if (seiMessage && seiMessage.recovery_point && seiMessage.recovery_point.exact_match_flag === 1) {
    return true;
  }

  return false;
};

var validateContainers = function validateContainers(esMap) {
  var warnings = [];
  var errors = [];

  var iFrames = esMap.filter(function (esEl) {
    return esEl.type === 'video';
  }).filter(isIFrame);

  if (iFrames.length === 0) {
    warnings.push('Segment has no I-frames');
  }

  var firstVideoFrame = esMap.find(function (esEl) {
    return esEl.type === 'video';
  });

  if (firstVideoFrame && !isIFrame(firstVideoFrame)) {
    warnings.push('Segment does not start with an I-frame');
  }

  var unknownPackets = esMap.filter(function (esEl) {
    return esEl.type.startsWith('unknown-');
  });

  if (unknownPackets.length > 0) {
    warnings.push('Detected ' + unknownPackets.length + ' packets with unknown types');
  }

  var pid0Packets = esMap.filter(function (esEl) {
    return esEl.pid === 0;
  });
  var invalidPid0Packets = pid0Packets.filter(function (esEl) {
    return esEl.type !== 'pat';
  });

  if (invalidPid0Packets.length > 0) {
    errors.push('Detected ' + invalidPid0Packets.length + ' packets with pid 0 and a non-PAT type');
  }

  var multiProgramPats = esMap.filter(function (esEl) {
    return esEl.type === 'pat' && Object.keys(esEl.table).length > 1;
  });

  if (multiProgramPats.length > 0) {
    errors.push('Detected ' + multiProgramPats.length + ' PAT packet(s) with more than one program');
  }

  // we only parse the first PMT PID from the PAT, so we can also check for extra programs
  // by seeing if there are PMTs with different IDs
  var pmtPackets = esMap.filter(function (esEl) {
    return esEl.type === 'pmt';
  });
  var pmtPids = Array.from(new Set(pmtPackets.map(function (packet) {
    return packet.pid;
  })));

  if (pmtPids.length > 1) {
    errors.push('Detected ' + pmtPids.length + ' programs in the stream (more than allowed 1)');
  }

  var tracks = [];

  // find tracks with unique IDs
  pmtPackets.forEach(function (pmtPacket) {
    pmtPacket.tracks.forEach(function (track) {
      if (!tracks.find(function (seenTrack) {
        return seenTrack.id === track.id;
      })) {
        tracks.push(track);
      }
    });
  });

  var audioTracks = tracks.filter(function (track) {
    return track.type === 'audio';
  });

  if (audioTracks.length > 1) {
    warnings.push('Detected ' + audioTracks.length + ' audio tracks (more than preferred 1)');
  }

  if (audioTracks.length >= 1) {
    var audioCodecs = Array.from(new Set(audioTracks.map(function (audioTrack) {
      return audioTrack.codec;
    })));
    var unsupportedAudioCodecs = audioCodecs.filter(function (audioCodec) {
      return audioCodec !== 'adts';
    });

    if (unsupportedAudioCodecs.length > 0) {
      warnings.push('Detected unsupported audio codec(s) ' + unsupportedAudioCodecs.join(', ') + ' ' + '(we only support AAC, determined by presence of ADTS)');
    }
  }

  var videoTracks = tracks.filter(function (track) {
    return track.type === 'video';
  });

  if (videoTracks.length === 0) {
    warnings.push('No video track detected');
  }

  if (videoTracks.length > 1) {
    warnings.push('Detected ' + videoTracks.length + ' video tracks (more than preferred 1)');
  }

  if (videoTracks.length >= 1) {
    var videoCodecs = Array.from(new Set(videoTracks.map(function (videoTrack) {
      return videoTrack.codec;
    })));
    var unsupportedVideoCodecs = videoCodecs.filter(function (videoCodec) {
      return videoCodec !== 'avc';
    });

    if (unsupportedVideoCodecs.length > 0) {
      warnings.push('Detected unsupported video codec(s) ' + unsupportedVideoCodecs.join(', ') + ' ' + '(we only support AVC)');
    }
  }

  var unsupportedTracks = tracks.filter(function (track) {
    return !['video', 'audio', 'metadata'].includes(track.type);
  });

  if (unsupportedTracks.length > 0) {
    warnings.push('Detected unsupported track types');
  }

  return {
    warnings: warnings,
    errors: errors
  };
};
exports.validateContainers = validateContainers;