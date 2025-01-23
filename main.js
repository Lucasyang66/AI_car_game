const carCanvas=document.getElementById("MainCanvas");
carCanvas.width=180;
const increaseCyclesButton = document.getElementById("increaseCyclesButton");
const decreaseCyclesButton = document.getElementById("decreaseCyclesButton");
const cycle_element = document.getElementById("cycle_text");

const carCtx = carCanvas.getContext("2d");
const road = new Road(carCanvas.width/2,carCanvas.width*0.85,3);
const score_element = document.getElementById("score_text");
const hscore_element = document.getElementById("hscore_text");
//const car = new Car(road.getLaneCenter(1),100 ,30 ,50, "AI");
let traffic = [
    new Car(road.getLaneCenter(1),-100,30,50,"npc"),
    new Car(road.getLaneCenter(0),-300,30,50,"npc"),
    new Car(road.getLaneCenter(2),-300,30,50,"npc"),
    new Car(road.getLaneCenter(0),-500,30,50,"npc"),
    new Car(road.getLaneCenter(1),-500,30,50,"npc"),
    new Car(road.getLaneCenter(1),-700,30,50,"npc"),
    new Car(road.getLaneCenter(2),-700,30,50,"npc"),
];
let base_cycles = 50;
let cycles = base_cycles;



let savedCars = [];
let gcount=1;
let stopcycle=0;

const N=400;
let cars=generateCars(N);
let bestCar=cars[0];
let generations = [bestCar];



function check_spawn(){
    if(traffic[traffic.length-1].y-traffic[0].y>=-800){
        spawn_traffic();
    }
}

function check_spawntest(){
    if(traffic[traffic.length-1].y>=bestCar.y){
        spawn_traffictest();
    }
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI",stopcycle));
    }
    return cars;
}

function game_restart(){
    car.x=100;
    car.y=30;
    car.angle=0;
    car.speed=0;
    traffic.length=0;
    //spawn_traffic(500,false);
    spawn_traffictest();
    car.damage=false;
}

function spawn_traffictest(){
    traffic.push(new Car(road.getLaneCenter(1),bestCar.y-200,30,50,"npc"));
    traffic.push(new Car(road.getLaneCenter(0),bestCar.y-400,30,50,"npc"));
    traffic.push(new Car(road.getLaneCenter(2),bestCar.y-400,30,50,"npc"));
    traffic.push(new Car(road.getLaneCenter(0),bestCar.y-600,30,50,"npc"));
    traffic.push(new Car(road.getLaneCenter(1),bestCar.y-600,30,50,"npc"));
    traffic.push(new Car(road.getLaneCenter(1),bestCar.y-800,30,50,"npc"));
    traffic.push(new Car(road.getLaneCenter(2),bestCar.y-800,30,50,"npc"));
}

function spawn_traffic(y=200,b=true){
    let vehicle_count=Math.round(Math.random())+road.TotalLane-2;
    let lane;
    let a=0;
    let used=[];
    for(let i=0; i<vehicle_count; i++){
        lane=Math.round(Math.random()*(road.TotalLane-1));
        for(let j=0; j<used.length; j++){
            if(used[j]==lane){
                i--;
                a++;
                break;
            }
        }
        if(a==0){
            used.push(lane);
            traffic.push(new Car(road.getLaneCenter(lane),(b?traffic[traffic.length-1-i].y:bestCar.y)-y,30,50,"npc"));
        }
        a=0;
    }
}
//spawn_traffic(500,false);
document.addEventListener('DOMContentLoaded', function() {
    const increaseCyclesButton = document.getElementById("increaseCyclesButton");
    const decreaseCyclesButton = document.getElementById("decreaseCyclesButton");
    const cycle_element = document.getElementById("cycle_text");
    cycle_element.innerHTML = "Cycles: " + cycles;
    increaseCyclesButton.addEventListener("click", () => {
        base_cycles += 5;
        if(base_cycles > 200) base_cycles = 200;
        cycles = base_cycles;
        cycle_element.innerHTML = "Cycles: " + cycles;
    });

    decreaseCyclesButton.addEventListener("click", () => {
        base_cycles -= 5;
        if(base_cycles<1) base_cycles = 1;
        cycles = base_cycles;
       cycle_element.innerHTML = "Cycles: " + cycles;
    });
    animate();
});



function update(){
    for(let n=0; n<cycles; n++){
        //if(bestCar.score==3000) spawn_traffic();
        check_spawn();
    
        console.log(bestCar.l,bestCar.r);
        //if(car.damage) game_restart();
        if(cars.length==0){
            gcount++;
            traffic = [];
            generations.push(bestCar);
            if(generations.length>3){
                generations.sort((a, b) => {
                    return a.score - b.score;
                  });
                //console.log(bestCar.score);
                //console.log(generations[0].score);
                if(bestCar.score<=generations[2].score) stopcycle++;
                else {stopcycle=0;}
                console.log(stopcycle);
                generations.splice(0,1);
            }
            hscore_element.innerHTML = Math.round(generations[generations.length-1].score)+500;
            let mutation_rate = 0.3/(gcount/50);
            if(mutation_rate < 0.005) mutation_rate = 0.005; 
            nextGeneration();
            console.log(generations);

            //console.log(stopcycle);
            bestCar=cars[0];
            spawn_traffictest();
        }
        for(let i=0; i<traffic.length; i++){
            traffic[i].update(road.borders,[]);
            if(traffic[i].y-360>bestCar.y){
                traffic.splice(i,1);
            }
        }
        
        bestCar=cars.find(
            c=>c.y==Math.min(
                ...cars.map(c=>c.y)
            ));
        for(let i=0;i<cars.length;i++){
            cars[i].update(road.borders,traffic);
            if(cars[i].damage) {
                cars.splice(i,1);
            };
        }
        //console.log(bestCar.brain.predict(bestCar.sensors.raydistance.map(s=>s==null?0:1-s.offset)));
    }


}
function draw(){
    score_element.innerHTML = Math.round(bestCar.score);
    //score_element.innerHTML = round(bestCar.score);
    carCanvas.height=window.innerHeight;
    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.75);
    road.draw(carCtx);

    carCtx.globalAlpha=0.2;

    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }

    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);
    carCtx.restore();
}
function animate(){
    update();
    draw();
    requestAnimationFrame(animate);
}