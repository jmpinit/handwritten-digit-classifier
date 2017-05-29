function sampleNormal(standardDeviation) {
  const x1 = Math.random();
  const x2 = Math.random();
  return standardDeviation * Math.sqrt(-2 * Math.log(x1)) * Math.cos(2 * Math.pi * x2);
}

function rectifier(v) {
  return Math.max(0, v);
}

function rectifierDerivative(v) {
  return v < 0 ? 0 : 1;
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

    // For backpropagation remember the input to the activation function
    this.z = 0;
  }

  activation() {
    this.z = zip(this.weights, this.inputs).reduce((sum, [weight, input]) =>
      sum + (weight * input.activation()), 0) + this.bias;

    return rectifier(this.z);
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

  const backPropagation = (correctAnswer) => {
    const outermostDelta = outputNeurons.map(outNeuron =>
      (outNeuron.activation() - correctAnswer) * rectifierDerivative(outNeuron.z));

    const propagateDelta = (delta, layerOuter, layerInner) => {
      const weightsByInner = range(layerInner.length).map(i =>
        layerOuter.map(n => n.weights[i]));
      const deltaActivations = layerInner.map(innerNeuron =>
        rectifierDerivative(innerNeuron.z));

      const backErrorPart = weightsByInner.map(weights =>
        zip(weights, delta).reduce((sum, [w, e]) => w * e, 0));

      // Compute new delta
      return zip(backErrorPart, deltaActivations).map(([e, a]) => e * a);
    };

    const hiddenDelta = propagateDelta(outermostDelta, outputNeurons, hiddenLayer);
  };

  const gradientDescent = (learningRate, layerOuter, layerInner, delta) => {
    layerOuter.forEach((neuron, i) => {
      const deltaCostByWeights = neuron.inputs
        .map((input, i) => input.activation() * delta[i]);

      neuron.weights = zip(neuron.weights, deltaCostByWeights)
        .map(([w, dCW]) => w - learningRate * dCW);

      neuron.bias = delta[i]
    });
  };

    /*
    const layerErrors = zip(), outputError)
      .map(([w, e]) => w * e * deltaActivation[)

    () * rectifierDerivative(hiddenNeuron.z)
    */
  };

  return {
    inputs: inputNeurons,
    outputs: outputNeurons,
  };
}

module.exports = {
  makeNetwork,
};
