
class Car{
    constructor(x,y,width,height,cartype,brain,stopcycle=0, otherBrain = null){
        this.x=x;
        this.y=y;
        this.score=0;
        this.width=width;
        this.height=height;
        this.speed=0;
        this.l=0;
        this.r=0;
        this.fitness = 0;
        this.cartype=cartype;
        if(cartype=="npc"){
            this.maxspeed=1.5;
        }
        else{
            this.maxspeed=2;
        }
        this.isAI=cartype=="AI";
        this.friction=0.04;
        this.acceleration=0.1;
        this.angle=0;
        this.damage=false;
        this.prevAngle = null;
        if(cartype!="npc"){
            this.sensors= new Sensor(this);
        }
        if(this.isAI){
            if (brain instanceof NeuralNetwork) {
                this.brain = brain.copy();
                if(stopcycle>3) this.brain.mutate(big_mutate);
                else this.brain.mutate(mutate, otherBrain);
              } 
            else {
                this.brain = new NeuralNetwork(this.sensors.rayCount, 8, 2);
              }
        }

        this.controls= new Control(cartype);

        this.img= new Image();
        this.img.src="car.png";
    }

    think(offset){
        let outputs = this.brain.predict(offset);
        this.controls.forward=1;
        this.l=outputs[0];
        this.r=outputs[1];
        //if(outputs[0]<0.5) this.controls.left=1;
        //if(outputs[1]<0.5) this.controls.right=1;
        this.controls.left=outputs[0];
        this.controls.right=outputs[1];
    }

    update(RoadBorders,traffic){
        if(this.cartype!="npc") this.maxspeed = 2+(Math.round(this.score/200))/10;
        this.score=Math.sqrt(Math.round(-this.y/10))+10;

        let laneCenter = road.getLaneCenter(1);
        let distanceToCenter = Math.abs(this.x - laneCenter);
        let centerReward = Math.exp(-distanceToCenter * 0.01);

        let smoothReward = 0;
        if(this.prevAngle!=null) smoothReward = Math.abs(this.angle-this.prevAngle);

        this.score+=centerReward*5;
        this.score-=smoothReward;
        this.prevAngle=this.angle;
        
        this.polygon=this.#createPolygon();
        
        if(!this.damage) {
            this.#move();
            this.damage=this.#assessDamage(RoadBorders,traffic);
        }

        if(this.damage){
            this.score-=500;
        }
        
        if(this.sensors){
            this.sensors.update(RoadBorders,traffic);
            const offsets=this.sensors.raydistance.map(s=>s==null?0:1-s.offset);
            this.think(offsets);
        }
    }

    #assessDamage(roadBorders,traffic){
        for(let i=0;i<roadBorders.length;i++){
            if(polysIntersect(this.polygon,roadBorders[i])){
                return true;
            }
        }
        for(let i=0;i<traffic.length;i++){
            if(polysIntersect(this.polygon,traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }

    #createPolygon(){
        const points=[];
        const rad=Math.hypot(this.width,this.height)/2;
        const alpha=Math.atan2(this.width,this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        return points;
    }

    #move(){
        if(this.controls.forward==true){
            this.speed+=this.acceleration;
        }
        if(this.controls.down==true){
            this.speed-=this.acceleration;
        }
        if(this.speed>this.maxspeed){
            this.speed=this.maxspeed;
        }
        if(this.speed<-this.maxspeed/2){
            this.speed=-this.maxspeed/2;
        }
        if(this.speed>0){
            this.speed-=this.friction;
        }
        if(this.speed<0){
            this.speed+=this.friction;
        }
        if(Math.abs(this.speed)<this.friction){
            this.speed=0;
        }
        if(this.speed!=0){
            let flip;
            if(this.speed>0){
                flip=1;
            }
            else{
                flip=-1;
            }
            if(this.controls.left==true){
                this.angle+=0.009*flip;
            }
            if(this.controls.right==true){
                this.angle-=0.009*flip;
            }
        }
        this.x-=Math.sin(this.angle)*this.speed;
        this.y-=Math.cos(this.angle)*this.speed;
    }
    draw(ctx,drawSensors=false){
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);
        ctx.drawImage(this.img,-this.width/2,-this.height/2,this.width,this.height);
        ctx.restore();
        if(this.sensors && drawSensors){
            this.sensors.draw(ctx);
        }
    }
}