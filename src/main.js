const path = require('path');
const idx = require('./idx');

process.on('unhandledRejection',
  error => console.log('unhandledRejection', error.stack));

function main() {
  // Print the shape of the IDX data that was read
  idx.readIDXFile(path.join(__dirname, '../public/data/t10k-images-idx3-ubyte'))
    .then((data) => console.log(data.length, data[0].length, data[0][0].length));
}

main();
