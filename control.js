class Control{
    constructor(type){
        this.forward=false;
        this.left=false;
        this.right=false;
        this.down=false;

        switch(type){
            case "player":
                this.#Keyboardlistener();
                break;
            case "npc":
                this.forward=true;
                break;
        }
    }
    #Keyboardlistener(){
        document.onkeydown=(event)=>{
            switch(event.key){
                case "a":
                    this.left=true;
                    break;
                case "d":
                    this.right=true;
                    break;
                case "w":
                    this.forward=true;
                    break;
                case "s":
                    this.down=true;
                    break;
            }
        }
        document.onkeyup=(event)=>{
            switch(event.key){
                case "a":
                    this.left=false;
                    break;
                case "d":
                    this.right=false;
                    break;
                case "w":
                    this.forward=false;
                    break;
                case "s":
                    this.down=false;
                    break;
            }
        }
    }
}