import { RobotShape } from './RobotShape.js';

let black_threshold = 100;
//var an =[0];

class RobotSim {
    constructor(scene){
        this.width = 100;
        this.length = 130;
        this.NumberOfSensors = 2;
        this.SensorSpacing = 15;
        this.speed =  new THREE.Vector2(0,5);   // CHANGE THIS TO ZERO!
        this.av = new THREE.Vector2(0, 0);
        this.v = 0;        
        this.dv = new THREE.Vector2(1, 0);
        this.an = new Array(this.NumberOfSensors);
        this.scene = scene;

        this.shape = new RobotShape(this.width, this.length, this.NumberOfSensors,  this.SensorSpacing = 15);
        this.setPosition(500, 610);
        scene.add(this.shape);
	}
	setPosition(x, y){
        this.shape.position.set(x,y,0);
    }
	setDirection(x,y){
		this.shape.rotation.z = Math.atan2(y, x);
    }
    Set_PWM(n, speed){
        if(n == 0)
            this.speed.x = speed / 100.0;
        else
           this.speed.y = speed / 100.0;
    }
    update(){
//        $("#debugtext").text(this.shape.sensors[0].position.x+", "+this.shape.sensors[0].position.y);
//        $("#debugtext").text(this.av.x+", "+this.av.y);
    }
    isLoaded(){
        return this.shape.isLoaded;
    }
    move(){
        this.updateSensors();
        this.RobotControl()
        this.av.multiplyScalar(0.95).add(this.speed.clone().multiplyScalar(0.05));
        this.vv = this.dv.clone().multiplyScalar((this.av.x+this.av.y)/2);
        this.setPosition(this.shape.position.x + this.vv.x, this.shape.position.y + this.vv.y);
        this.dv.rotateAround(new THREE.Vector2(0,0), (this.av.x-this.av.y)/this.width);
        this.shape.rotation.z = Math.atan2(this.dv.y, this.dv.x);
        this.shape.Rw.rotation.z -= this.av.y / 20.0;
        this.shape.Lw.rotation.z -= this.av.x / 20.0;
    }
    updateSensors(){
        for(var n = 0; n < this.NumberOfSensors; n++) {
            var sn = this.shape.sensors[n].position.clone().applyAxisAngle(new THREE.Vector3(0,0,1),Math.atan2(this.dv.y, this.dv.x)).add(this.shape.position);            
            this.an[n] = this.scene.getSensorOutput(sn.x, sn.y);
            this.shape.sensors[n].material = (this.an[n] <= black_threshold) ? this.shape.sensorLEDMat : this.shape.sensorLEDMatOn; 
          }        
    }
    RobotControl() {  // Do not change this line
/*        if (this.an[0] <= black_threshold) {      // IF WHITE
          this.Set_PWM(0, 300);  // Motor 0 fast
          this.Set_PWM(1, 50);   // Motor 1 slow
        } else {                             // IF BLACK
            this.Set_PWM(0, 50);   // Motor 0 slow
            this.Set_PWM(1, 300);  // Motor 1 fast
        }   */
        if(this.an[0] <= black_threshold && this.an[1] > black_threshold)   // WHITE, BLACK
        {
            this.Set_PWM(0, 600);  // Motor 0 fast
            this.Set_PWM(1, 200);  // Motor 1 slow
        }
        else 
        if(this.an[0] > black_threshold && this.an[1] <= black_threshold)   // BLACK, WHITE
        {
            this.Set_PWM(0, 200);  // Motor 0 slow
            this.Set_PWM(1, 600);  // Motor 1 fast
        }
        else
        if(this.an[0] > black_threshold && this.an[1] > black_threshold)    // BLACK, BLACK
        {
            this.Set_PWM(0, 400);  // Motor 0 medium
            this.Set_PWM(1, 400);  // Motor 1 medium
        }    
      }
}

export { RobotSim }; 