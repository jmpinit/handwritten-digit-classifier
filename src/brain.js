function sampleNormal(standardDeviation) {
  const x1 = Math.random();
  const x2 = Math.random();
  return standardDeviation * Math.sqrt(-2 * Math.log(x1)) * Math.cos(2 * Math.pi * x2);
}

function rectifier(v) {
  return Math.max(0, v);
}

function range(len) {
  return Array.apply(null, Array(len)).map((_, i) => i);
}

function zip(...lists) {
  if (lists.length === 1) {
    return lists[0];
  }

  if (lists.some(list => list.length !== lists[0].length)) {
    throw new Error('All lists must be the same length');
  }

  const zipped = [];
  for (let i = 0; i < lists[0].length; i++) {
    zipped[i] = lists.map(list => list[i]);
  }

  return zipped;
}

class Neuron {
  constructor() {
    this.bias = 0;

    // Values between 0 and 1
    this.weights = [];

    // Functions that emit a value between 0 and 1
    this.inputs = [];
  }

  activation() {
    return zip(this.weights, this.inputs).reduce((sum, [weight, input]) =>
      sum + (weight * input.activation()), 0) + this.bias;
  }

  connect(neuron, weight) {
    this.weights.push(weight);
    this.inputs.push(neuron);
  }
}

class InputNeuron extends Neuron {
  constructor() {
    super();
    this.activationValue = 0;
  }

  activation() {
    return this.activationValue;
  }

  set(v) {
    this.activationValue = v;
  }
}

function fullyConnect(layerB, layerA) {
  layerB.forEach(n1 => layerA.forEach(n0 => n1.connect(n0, 0)));
}

function makeNetwork(width, height) {
  const numberOfHidden = 15;

  const inputNeurons = range(width * height).map(() => new InputNeuron());
  const hiddenLayer = range(numberOfHidden).map(() => new Neuron());
  const outputNeurons = range(10).map(() => new Neuron());

  fullyConnect(hiddenLayer, inputNeurons);
  fullyConnect(outputNeurons, hiddenLayer);

  return {
    inputs: inputNeurons,
    outputs: outputNeurons,
  };
}

module.exports = {
  makeNetwork,
};
