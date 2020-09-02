import { RobotShape } from './RobotShape.js';

class RobotSim {
    constructor(){
        this.width = 100;
        this.length = 130;
        this.NumberOfSensors = 4;
        this.SensorSpacing = 15;
        
        this.shape = new RobotShape(100,130,4,15);

		this.setPosition(600, 450);
	}
	setPosition(x, y){
        this.shape.position.set(x,y,0);
	}
	setDirection(x,y){
		this.shape.rotation.z = Math.atan2(y, x);
	}
}

export { RobotSim }; 