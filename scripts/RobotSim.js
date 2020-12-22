import { RobotShape } from './RobotShape.js';
import { RobotCompiler } from './RobotCompiler.js';

let black_threshold = 100;

class RobotSim {
    constructor(scene, start){
        this.cpp = new RobotCompiler();

        this.width = 100;
        this.length = 130;
        this.NumberOfSensors = 2;
        this.SensorSpacing = 15;
        this.speed =  new THREE.Vector2(0,0);   // CHANGE THIS TO ZERO!
        this.av = new THREE.Vector2(0, 0);
        this.v = 0;        
        this.scene = scene;
        this.pose = {xy: math.Complex(start.x-this.length,start.y), bearing: math.Complex(1), R: math.Complex(1), L: math.Complex(1), an: new Array(this.NumberOfSensors)};
        this.shape = new RobotShape(this.width, this.length, this.NumberOfSensors,  this.SensorSpacing);     
        this.sensorPos = [];
        for(var n = 0; n < this.NumberOfSensors; n++) {
            this.sensorPos.push(new THREE.Vector3(this.length, (n - (this.NumberOfSensors-1.0)/2.0)*this.SensorSpacing, 0));
        }
        scene.add(this.shape);
	}
    Set_PWM(n, speed){
        if(n == 0)
            this.speed.x = speed / 100.0;
        else
            this.speed.y = speed / 100.0;
    }
    update(){
        this.shape.Rw.rotation.z = this.pose.R.toPolar().phi;
        this.shape.Lw.rotation.z = this.pose.L.toPolar().phi;
        this.shape.position.set(this.pose.xy.re, this.pose.xy.im, 0);
        this.shape.rotation.z = this.pose.bearing.toPolar().phi;
        for(var n = 0; n < this.NumberOfSensors; n++) {
            this.shape.sensors[n].material = (this.pose.an[n] <= black_threshold) ? this.shape.sensorLEDMat : this.shape.sensorLEDMatOn; 
        }
    }
    isLoaded(){
        return this.shape.isLoaded;
    }
    move(){
        this.updateSensors();
        this.RobotControl();
        this.av.multiplyScalar(0.95).add(this.speed.clone().multiplyScalar(0.05));
        this.vv = math.multiply(this.pose.bearing, (this.av.x+this.av.y)/2);        
        this.pose.bearing = math.multiply(this.pose.bearing, math.Complex.fromPolar(1, (this.av.x-this.av.y)/this.width));
        this.pose.xy = math.add(this.pose.xy, this.vv);
        this.pose.R = math.multiply(this.pose.R, math.Complex.fromPolar(1, -this.av.y / 20.0));
        this.pose.L = math.multiply(this.pose.L, math.Complex.fromPolar(1, -this.av.x / 20.0))
    }

    updateSensors(){
        for(var n = 0; n < this.NumberOfSensors; n++) {
            var sn = this.sensorPos[n].clone().applyAxisAngle(new THREE.Vector3(0,0,1),this.pose.bearing.toPolar().phi).add(new THREE.Vector3(this.pose.xy.re,this.pose.xy.im, 0));                                
            this.pose.an[n] = this.scene.getSensorOutput(sn.x, sn.y);
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
        if(this.pose.an[0] <= black_threshold && this.pose.an[1] > black_threshold)   // WHITE, BLACK
        {
            this.Set_PWM(0, 500);  // Motor 0 fast
            this.Set_PWM(1, 100);  // Motor 1 slow
        }
        else 
        if(this.pose.an[0] > black_threshold && this.pose.an[1] <= black_threshold)   // BLACK, WHITE
        {
            this.Set_PWM(0, 100);  // Motor 0 slow
            this.Set_PWM(1, 500);  // Motor 1 fast
        }
        else
        if(this.pose.an[0] > black_threshold && this.pose.an[1] > black_threshold)    // BLACK, BLACK
        {
            this.Set_PWM(0, 400);  // Motor 0 medium
            this.Set_PWM(1, 400);  // Motor 1 medium
        }    
      }
}

export { RobotSim }; 