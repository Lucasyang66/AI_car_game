class Sensor{
    constructor(car){
        this.car=car;
        this.rayCount=5;
        this.rayLength=180;
        this.raySpread=0.7;

        this.rays=[];
        this.raydistance=[];
    }

    update(RoadBorders,traffic){
        this.#update_rays();
        this.raydistance=[];
        for(let i=0; i<this.rays.length; i++){
            this.raydistance.push(this.#return_distance(this.rays[i],RoadBorders,traffic));
        };
    }

    #return_distance(ray,RoadBorders,traffic){
        let touches=[];
        for(let i=0; i<RoadBorders.length; i++){
            const touch=getIntersection(ray[0],ray[1],RoadBorders[i][0],RoadBorders[i][1]);
            if(touch){
                touches.push(touch);
            }
        }
        for(let i=0;i<traffic.length;i++){
            const poly=traffic[i].polygon;
            for(let j=0;j<poly.length;j++){
                const value=getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );
                if(value){
                    touches.push(value);
                }
            }
        }

        if(touches.length==0){
            return null;
        }
        else{
            const offsets=touches.map(e=>e.offset);
            const minoffset=Math.min(...offsets);
            return touches.find(e=>e.offset==minoffset);
        }
    }
    
    #update_rays(){
        this.rays=[];
            for(let i=0;i<this.rayCount;i++){
                const rayAngle=proportion(
                    this.raySpread/2,
                    -this.raySpread/2,
                    this.rayCount==1?0.5:i/(this.rayCount-1)
                )+this.car.angle;
    
                const start={x:this.car.x, y:this.car.y};
                const end={
                    x:this.car.x-
                        Math.sin(rayAngle)*this.rayLength,
                    y:this.car.y-
                        Math.cos(rayAngle)*this.rayLength
                };
                this.rays.push([start,end]);
            }
    }
    draw(ctx){
        //ctx.globalAlpha = 0.4;
        for(let i=0;i<this.rayCount;i++){
            let endpoint=this.rays[i][1];
            if(this.raydistance[i]!=null){
                endpoint=this.raydistance[i];
            }
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                endpoint.x,
                endpoint.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="red";
            ctx.moveTo(
                endpoint.x,
                endpoint.y
            );
            ctx.lineTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.stroke();
        }
        //ctx.globalAlpha = 1;
    }        
}