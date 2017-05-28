const path = require('path');
const idx = require('./idx');
const brain = require('./brain');

process.on('unhandledRejection',
  error => console.log('unhandledRejection', error.stack));

function loadDataFromFile(filename) {
  return idx.readIDXFile(path.join(__dirname, '../public/data/', filename));
}

function printImage(image) {
  const palette = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
  const charWithBrightness = b => palette[Math.floor((b / 256) * palette.length)];

  image.forEach(row =>
    console.log(row.reduce((s, v) => s + charWithBrightness(255 - v), '')));
}

function main() {
  const nn = brain.makeNetwork(28, 28);

  const testImagesPromise = loadDataFromFile('t10k-images-idx3-ubyte');
  const testLabelsPromise = loadDataFromFile('t10k-labels-idx1-ubyte');
  const trainingImagesPromise = loadDataFromFile('train-images-idx3-ubyte');
  const trainingLabelsPromise = loadDataFromFile('train-labels-idx1-ubyte');

  Promise.all([
    testImagesPromise,
    testLabelsPromise,
    trainingImagesPromise,
    trainingLabelsPromise,
  ]).then(([testImages, testLabels, trainingImages, trainingLabels]) => {
    const image = testImages[0];

    printImage(image);

    nn.inputs.forEach((n, i) => {
      const x = i % 28;
      const y = Math.floor(i / 28) || 0;
      n.set(image[y][x]);
    });

    nn.outputs.forEach((out, i) =>
      console.log(`Digit ${i} neuron activated at ${out.activation()}`));
  });
}

main();
