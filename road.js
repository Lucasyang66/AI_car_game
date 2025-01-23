class Road{
    constructor(x,width,TotalLane=3){
        this.x=x;
        this.width=width;
        this.TotalLane=TotalLane;
        this.left=x-width/2;
        this.right=x+width/2;

        const RoadLength=500000;
        this.top=-RoadLength;
        this.bottom=1000;

        const topLeft={x:this.left,y:this.top};
        const topRight={x:this.right,y:this.top};
        const bottomLeft={x:this.left,y:this.bottom};
        const bottomRight={x:this.right,y:this.bottom};
        this.borders=[
            [topLeft,bottomLeft],
            [topRight,bottomRight]
        ];
    }
    
    draw(ctx){
        for(let i=1; i<=this.TotalLane-1; i++){
            const c=proportion(this.left,this.right,i/this.TotalLane);
            ctx.lineWidth=5;
            ctx.strokeStyle="white";
            ctx.setLineDash([20,20]);
            ctx.beginPath();
            ctx.moveTo(c,this.top);
            ctx.lineTo(c,this.bottom);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        this.borders.forEach(border=>{
            ctx.beginPath();
            ctx.moveTo(border[0].x,border[0].y);
            ctx.lineTo(border[1].x,border[1].y);
            ctx.stroke();
        });
    }

    getLaneCenter(laneIndex){
        const laneWidth=this.width/this.TotalLane;
        return this.left+laneWidth/2 + Math.min(laneIndex,this.TotalLane-1)*laneWidth;
    }
}