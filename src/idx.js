const fs = require('fs');

const idxDataTypes = {
  0x08: {
    name: 'unsigned byte',
    length: 1,
    read: (buff, i) => buff.readUInt8(i),
  },
  0x09: {
    name: 'signed byte',
    length: 1,
    read: (buff, i) => buff.readInt8(i),
  },
  0x0B: {
    name: 'short',
    length: 2,
    read: (buff, i) => buff.readInt16BE(i),
  },
  0x0C: {
    name: 'int',
    length: 4,
    read: (buff, i) => buff.readInt32BE(i),
  },
  0x0D: {
    name: 'float',
    length: 4,
    read: (buff, i) => buff.readFloatBE(i),
  },
  0x0E: {
    name: 'double (8 bytes)',
    length: 8,
    read: (buff, i) => buff.readDoubleBE(i),
  },
};

function partition(groupSize, array) {
  const groups = [];

  for (let i = 0; i < array.length; i += groupSize) {
    groups.push(array.slice(i, i + groupSize));
  }

  return groups;
}

// Deepest group size last
function multiPartition(sizes, array) {
  return sizes.length === 0 ?
    array :
    partition(sizes[0], multiPartition(sizes.slice(1), array));
}

function readDimensionHeader(buffer, startIndex) {
  const numDimensions = buffer.readUInt8(startIndex);

  if (numDimensions === 0) {
    throw new Error('Zero dimensions');
  }

  const dimensionSizes = [];

  for (let i = 0; i < numDimensions; i++) {
    const size = buffer.readUInt32BE(4 + (i * 4));

    if (size < 1) {
      throw new Error(`Size of dimension ${i} must be greater than 1`);
    }

    // Store sizes from lowest to highest order
    dimensionSizes.push(size);
  }

  return dimensionSizes;
}

function decodeIDX(idxData) {
  if (idxData.length < 16) {
    throw new Error(`Data not long enough for IDX header. Must be at least 16 bytes but is ${idxData.length} bytes`);
  }

  // Read the IDX header
  const magic = idxData.readUInt16BE(0);
  const dataTypeIndex = idxData.readUInt8(2);
  const dataType = idxDataTypes[dataTypeIndex];
  const dimensionSizes = readDimensionHeader(idxData, 3);
  const dataStartIndex = 4 + (dimensionSizes.length * 4);

  if (magic !== 0) {
    throw new Error('Not IDX file, magic bytes not zero');
  }

  if (!(dataTypeIndex in idxDataTypes)) {
    throw new Error(`Unrecognized data type value: ${dataType}`);
  }

  if ((idxData.length - dataStartIndex) % dataType.length !== 0) {
    throw new Error(`Data type ${dataType.name} of length ${dataType.length} does not fit data length`);
  }

  const data = [];
  for (let i = dataStartIndex; i < idxData.length; i += dataType.length) {
    data.push(dataType.read(idxData, i));
  }

  return multiPartition(dimensionSizes, data)[0];
}

function readIDXFile(filepath) {
  return new Promise((fulfill, reject) => {
    const chunks = [];
    const readStream = fs.createReadStream(filepath);

    readStream.on('data', chunk => { chunks.push(chunk); })
      .on('error', err => reject(err))
      .on('end', () => {
        try {
          const idxData = decodeIDX(Buffer.concat(chunks));
          fulfill(idxData);
        } catch (e) {
          reject(e);
        }
      });
  });
}

module.exports = {
  readIDXFile,
};
