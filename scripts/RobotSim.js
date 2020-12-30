import { RobotShape } from './RobotShape.js';


let black_threshold = 100;

class RobotSim {
    constructor(scene, start, params){
        this.width = params.width;
        this.length = params.length;
        this.NumberOfSensors = params.NumberOfSensors;
        this.SensorSpacing = params.SensorSpacing;
//        this.speed =  new THREE.Vector2(0,0);
//        this.av = new THREE.Vector2(0, 0);
//        this.v = 0;        
        this.scene = scene;
//        this.pose = {xy: math.Complex(start.x-this.length,start.y), bearing: math.Complex(1), R: math.Complex(1), L: math.Complex(1), an: new Array(this.NumberOfSensors)};
        this.shape = new RobotShape(this.width, this.length, this.NumberOfSensors,  this.SensorSpacing);     
//        this.sensorPos = [];
//        for(var n = 0; n < this.NumberOfSensors; n++) {
//            this.sensorPos.push(new THREE.Vector3(this.length, (n - (this.NumberOfSensors-1.0)/2.0)*this.SensorSpacing, 0));
//        }
        scene.add(this.shape);
	}

    play(rec, frame){
        const n = (frame < 0) ? 0 : Math.max(0,Math.floor(frame));  // Integer part
        const f1 = (frame < 0) ? 0 : frame - n;                     // Fractional part
        const f0 = 1 - f1;                                          // 1 - Fractional part
        
        if(n+1 <= rec.length-1){   
            this.shape.Rw.rotation.z = math.add(math.multiply(f0,rec[n].pose.R),math.multiply(f1,rec[n+1].pose.R)).toPolar().phi;
            this.shape.Lw.rotation.z = math.add(math.multiply(f0,rec[n].pose.L),math.multiply(f0,rec[n+1].pose.L)).toPolar().phi;
            let xy = math.add(math.multiply(f0, rec[n].pose.xy),math.multiply(f1, rec[n+1].pose.xy));
            this.shape.position.set(xy.re, xy.im, 0); 
            this.shape.rotation.z = math.add(math.multiply(f0,rec[n].pose.bearing), math.multiply(f1,rec[n+1].pose.bearing)).toPolar().phi;   
            for(var m = 0; m < this.NumberOfSensors; m++) {
                this.shape.sensors[m].material = (rec[n].pose.an[m] <= black_threshold) ? this.shape.sensorLEDMat : this.shape.sensorLEDMatOn; 
            }            
        }
    }
    isLoaded(){
        return this.shape.isLoaded;
    }
}

export { RobotSim }; 