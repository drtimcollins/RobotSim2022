import { MAXSENSORS } from './RobotDraw.js';

class RobotShape extends THREE.Group{
    constructor(width, length, numSens, sensSpace){
        super();
        this.robotWidth  = width;
        this.robotLength = length;
        this.NumberOfSensors = numSens;
        this.SensorSpacing = sensSpace;
        this.isLoaded = false;
        //this.visible = false;
        this.checkSize();

        // Load wheel model and make wheels when loaded
        var loader = new THREE.PLYLoader();
        loader.load('img/wheel.ply', function(geometry) {
            geometry.computeFaceNormals();
            var wheelMat = new THREE.MeshLambertMaterial({reflectivity: 1, shading: THREE.SmoothShading, color: 0x444444});
            this.Rw = new THREE.Mesh(geometry, wheelMat);
            this.Rw.rotateX(-Math.PI/2);
            this.Lw = this.Rw.clone();
            this.Rw.position.set(0,this.robotWidth/2,-20);
            this.Lw.position.set(0,-this.robotWidth/2,-20);
            this.Rw.castShadow=true;
            this.Lw.castShadow=true;
            // body1 - box between the wheels
            var bodyMat = new THREE.MeshPhongMaterial({color: 0x2070D0, specular: 0x505050, shininess: 10, shading: THREE.SmoothShading  });
            var body1g = new THREE.CubeGeometry(40, this.robotWidth-10, 20);
            this.body1 = new THREE.Mesh(body1g, bodyMat);
            this.body1.position.set(0, 0, -20);
            this.body1.castShadow = true;
            // body2 - wedge connecting wheels to sensor bar
            var body2g = new THREE.Geometry();
            body2g.vertices.push(new THREE.Vector3(20, this.robotWidth/2-5, -10));
            body2g.vertices.push(new THREE.Vector3(20, this.robotWidth/2-5, -30));
            body2g.vertices.push(new THREE.Vector3(this.robotLength, 5, -10));
            body2g.vertices.push(new THREE.Vector3(this.robotLength, -5, -10));
            body2g.vertices.push(new THREE.Vector3(20, -this.robotWidth/2+5, -30));
            body2g.vertices.push(new THREE.Vector3(20, -this.robotWidth/2+5, -10));
            body2g.faces.push(new THREE.Face3(0,2,1));
            body2g.faces.push(new THREE.Face3(3,1,2));
            body2g.faces.push(new THREE.Face3(3,4,1));
            body2g.faces.push(new THREE.Face3(3,5,4));
            body2g.faces.push(new THREE.Face3(0,5,3));
            body2g.faces.push(new THREE.Face3(0,3,2));
            body2g.computeFaceNormals();
            this.body2 = new THREE.Mesh(body2g, bodyMat);
            this.body2.castShadow = true;
            // body3 - sensor bar
            var body3g = new THREE.CubeGeometry(14, 14 + this.SensorSpacing*(this.NumberOfSensors-1), 3);
            this.body3 = new THREE.Mesh(body3g, bodyMat);
            this.body3.position.set(this.robotLength, 0, -10);
            this.body3.castShadow = true;
            // body4/5 - caster
            this.body4 = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 8,  0, 2*Math.PI, 0, Math.PI/2), 
                new THREE.MeshPhongMaterial({color: 0xd0d0d0, specular: 0x505050, shininess: 100, shading: THREE.SmoothShading  }));
            this.body4.rotateX(Math.PI/2);
            this.body4.position.set(this.robotLength - 20, 0, -5);
            this.body5 = new THREE.Mesh(new THREE.CylinderGeometry(5.5,5.5,5.5,12),
                new THREE.MeshPhongMaterial({color: 0x000000, specular: 0x505050, shininess: 100, shading: THREE.SmoothShading  }));
            this.body5.rotateX(-Math.PI/2);
            this.body5.position.set(this.robotLength - 20, 0, -7.5);

            this.add(this.body1);
            this.add(this.body2);
            this.add(this.body3);
            this.add(this.body4);
            this.add(this.body5);
            this.add(this.Lw);    
            this.add(this.Rw);    
            
            this.sensors = [];
            this.sensorBoxes = [];
            var sensorLEDg = new THREE.SphereGeometry(4, 12, 8, 0, 2*Math.PI, 0, Math.PI/2);
            this.sensorLEDMat =  new THREE.MeshPhongMaterial({color: 0x600000, specular: 0x505050, shininess: 100, shading: THREE.SmoothShading  });
            this.sensorLEDMatOn =  new THREE.MeshPhongMaterial({color: 0x600000, emissive: 0xFF0000, specular: 0x505050, shininess: 100, shading: THREE.SmoothShading  });
            var sensorLEDMesh = new THREE.Mesh(sensorLEDg, this.sensorLEDMat);
            sensorLEDMesh.rotateX(-Math.PI/2);
            var sensorBoxg = new THREE.CubeGeometry(8, 5, 5);
            var sensorBoxMat =  new THREE.MeshPhongMaterial({color: 0x000000, specular: 0x505050, shininess: 100, shading: THREE.SmoothShading  });
            var sensorBoxMesh = new THREE.Mesh(sensorBoxg, sensorBoxMat);
            for(var n = 0; n < MAXSENSORS; n++){
                var sensorN = sensorLEDMesh.clone();
                //sensorN.rotateX(-Math.PI/2);
                sensorN.position.set(this.robotLength, (n - (this.NumberOfSensors-1.0)/2.0)*this.SensorSpacing, -11.5);
                this.sensors.push(sensorN);
                var sensorBoxN = sensorBoxMesh.clone();
                sensorBoxN.position.set(this.robotLength, (n - (this.NumberOfSensors-1.0)/2.0)*this.SensorSpacing, -7);
                this.sensorBoxes.push(sensorBoxN);
                this.sensors[n].visible = (n < this.NumberOfSensors);
                this.sensorBoxes[n].visible = (n < this.NumberOfSensors);
                this.add(this.sensors[n]);
                this.add(this.sensorBoxes[n]);                
            }
            this.isLoaded = true;  
        }.bind(this) , function() {});       
    }

    setSize(params){
        if (this.isLoaded){        
            this.robotWidth = params.width;
            this.robotLength = params.length;
            this.NumberOfSensors = params.NumberOfSensors;
            this.SensorSpacing = params.SensorSpacing;
            this.checkSize();            
            this.body1.geometry = new THREE.CubeGeometry(40, this.robotWidth-10, 20);
            var body2g = new THREE.Geometry();
            body2g.vertices.push(new THREE.Vector3(20, this.robotWidth/2-5, -10));
            body2g.vertices.push(new THREE.Vector3(20, this.robotWidth/2-5, -30));
            body2g.vertices.push(new THREE.Vector3(this.robotLength, 5, -10));
            body2g.vertices.push(new THREE.Vector3(this.robotLength, -5, -10));
            body2g.vertices.push(new THREE.Vector3(20, -this.robotWidth/2+5, -30));
            body2g.vertices.push(new THREE.Vector3(20, -this.robotWidth/2+5, -10));
            body2g.faces.push(new THREE.Face3(0,2,1));
            body2g.faces.push(new THREE.Face3(3,1,2));
            body2g.faces.push(new THREE.Face3(3,4,1));
            body2g.faces.push(new THREE.Face3(3,5,4));
            body2g.faces.push(new THREE.Face3(0,5,3));
            body2g.faces.push(new THREE.Face3(0,3,2));
            body2g.computeFaceNormals();
            this.body2.geometry = body2g;       
            this.Rw.position.set(0,this.robotWidth/2,-20);
            this.Lw.position.set(0,-this.robotWidth/2,-20);                 
            this.body3.geometry = new THREE.CubeGeometry(14, 14 + this.SensorSpacing*(this.NumberOfSensors-1), 3);
            this.body3.position.set(this.robotLength, 0, -10);
            this.body4.position.set(this.robotLength - 20, 0, -5);
            this.body5.position.set(this.robotLength - 20, 0, -7.5);
            for(var n = 0; n < MAXSENSORS; n++){
                this.sensors[n].position.set(this.robotLength, (n - (this.NumberOfSensors-1.0)/2.0)*this.SensorSpacing, -11.5);
                this.sensors[n].visible = (n < this.NumberOfSensors);
                this.sensorBoxes[n].position.set(this.robotLength, (n - (this.NumberOfSensors-1.0)/2.0)*this.SensorSpacing, -7);
                this.sensorBoxes[n].visible = (n < this.NumberOfSensors);
            }            
        }
    }

    checkSize(){
        let p0 = new THREE.Vector2(7 + this.robotLength, 7 + this.SensorSpacing*(this.NumberOfSensors-1)/2);
        let p1 = new THREE.Vector2(-20, this.robotWidth/2 + 4);
        this.xOffset = (p1.lengthSq() - p0.lengthSq()) / 2 / (p1.x - p0.x);
        let org = new THREE.Vector2(this.xOffset, 0);
        this.radius = p0.distanceTo(org);
        //console.log(p0.distanceTo(org).toString() + " --- " + p1.distanceTo(org).toString());
        //console.log(p0.clone().sub(org).length().toString() + " --- " + p1.clone().sub(org).length().toString());
    }
}

export { RobotShape }; 