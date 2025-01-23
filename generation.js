function nextGeneration() {
    console.log('generation: ' + gcount);
    for (let i = 0; i < N; i++) {
      cars[i] = pickOne(i);
    }
}

function pickOne(i){
  let otherBrain = null;
  if(Math.random()<0.5 && generations.length > 1){
    otherBrain = generations[Math.floor(Math.random() * generations.length)].brain;
  }
  return new Car(road.getLaneCenter(1),100,30,50,"AI",generations[i%generations.length].brain,otherBrain);
}