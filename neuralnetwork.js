class NeuralNetwork{
    constructor(a, b, c, d) {
        if (a instanceof tf.Sequential) {
          this.model = a;
          this.input_nodes = b;
          this.hidden_nodes = c;
          this.output_nodes = d;
        } else {
          this.input_nodes = a;
          this.hidden_nodes = b;
          this.output_nodes = c;
          this.model = this.createModel();
        }
    }

    predict(inputs) {
          const xs = tf.tensor2d([inputs]);
          const ys = this.model.predict(xs);
          const outputs = ys.dataSync();
          //console.log(outputs);
          return outputs;
      }
    
      mutate(rate, otherBrain = null) {
        const weights = this.model.getWeights();
        const mutatedWeights = [];
        for (let i = 0; i < weights.length; i++) {
            let tensor = weights[i];
            let shape = weights[i].shape;
            let values = tensor.dataSync().slice();
            for (let j = 0; j < values.length; j++) {
                if (random(1) < rate) {
                  let newx;
                  if (otherBrain) {
                    // Differential mutation
                      const otherWeights = otherBrain.model.getWeights();
                      const otherValues = otherWeights[i].dataSync().slice();
                      newx = values[j]+(otherValues[j]-values[j])*random(0,0.8);
                    } else {
                      newx = values[j];
                  }

                  if (random(1) < 0.2) { // 20% chance of weight replacement
                    newx = random(-1,1);
                  }

                  let offset = randomGaussian() * 0.5; // Gaussian offset
                  newx = newx + offset;

                  if(random(1)<0.1){ // 10% chance of zeroing the weight
                    newx = 0;
                  }
                  
                  values[j] = newx;
                }
            }
            let newTensor = tf.tensor(values, shape);
            mutatedWeights[i] = newTensor;
        }
        this.model.setWeights(mutatedWeights);
    };

    copy() {
        const modelCopy = this.createModel();
        const weights = this.model.getWeights();
        const weightCopies = [];
        for (let i = 0; i < weights.length; i++) {
            weightCopies[i] = weights[i].clone();
        }
        modelCopy.setWeights(weightCopies);
        return new NeuralNetwork(
        modelCopy,
        this.input_nodes,
        this.hidden_nodes,
        this.output_nodes
        );
    }
    
    createModel(){
        const model = tf.sequential();
        const hidden = tf.layers.dense({
        units: this.hidden_nodes,
        inputShape: [this.input_nodes],
        activation: 'relu'
        });
        model.add(hidden);
        const output = tf.layers.dense({
        units: this.output_nodes,
        activation: 'sigmoid'
        });
        model.add(output);
        return model;
    }
}