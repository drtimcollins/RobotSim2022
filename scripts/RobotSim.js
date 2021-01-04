import { RobotShape } from './RobotShape.js';
const black_threshold = 1000;

class RobotSim {
    constructor(scene, start, params){
        this.width = params.width;
        this.length = params.length;
        this.NumberOfSensors = params.NumberOfSensors;
        this.SensorSpacing = params.SensorSpacing;
        this.scene = scene;
        this.shape = new RobotShape(this.width, this.length, this.NumberOfSensors,  this.SensorSpacing);     
        this.shape.position.set(scene.width/2 - this.shape.xOffset, scene.height/2, 0);
        this.scene.turntableTop.geometry.scale(this.shape.radius/100,1,this.shape.radius/100);
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