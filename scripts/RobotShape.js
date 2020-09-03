class RobotShape extends THREE.Group{
    constructor(width, length, numSens, sensSpace){
        super();
        this.robotWidth  = width;
        this.robotLength = length;
        this.NumberOfSensors = numSens;
        this.SensorSpacing = sensSpace;
        this.isLoaded = false;

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
             var bodyMat = new THREE.MeshPhongMaterial({color: 0x2070D0, specular: 0x505050, shininess: 100, shading: THREE.SmoothShading  });
             var body1g = new THREE.CubeGeometry(40, this.robotWidth-10, 20);
             var body1 = new THREE.Mesh(body1g, bodyMat);
             body1.position.set(0, 0, -20);
             body1.castShadow = true;
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
             var body2 = new THREE.Mesh(body2g, bodyMat);
             body2.castShadow = true;
             // body3 - sensor bar
             var body3g = new THREE.CubeGeometry(14, 14 + this.SensorSpacing*(this.NumberOfSensors-1), 3);
             var body3 = new THREE.Mesh(body3g, bodyMat);
             body3.position.set(this.robotLength, 0, -10);
             body3.castShadow = true;
             // body4/5 - caster
             var body4 = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 8,  0, 2*Math.PI, 0, Math.PI/2), 
                 new THREE.MeshPhongMaterial({color: 0xd0d0d0, specular: 0x505050, shininess: 100, shading: THREE.SmoothShading  }));
             body4.rotateX(Math.PI/2);
             body4.position.set(this.robotLength - 20, 0, -5);
             var body5 = new THREE.Mesh(new THREE.CylinderGeometry(5.5,5.5,5.5,12),
                new THREE.MeshPhongMaterial({color: 0x000000, specular: 0x505050, shininess: 100, shading: THREE.SmoothShading  }));
            body5.rotateX(-Math.PI/2);
            body5.position.set(this.robotLength - 20, 0, -7.5);

             this.add(body1);
             this.add(body2);
             this.add(body3);
             this.add(body4);
             this.add(body5);
             this.add(this.Lw);    
             this.add(this.Rw);    
             
             this.sensors = [];
             var sensorLEDg = new THREE.SphereGeometry(4, 12, 8, 0, 2*Math.PI, 0, Math.PI/2);
             this.sensorLEDMat =  new THREE.MeshPhongMaterial({color: 0x600000, specular: 0x505050, shininess: 100, shading: THREE.SmoothShading  });
             this.sensorLEDMatOn =  new THREE.MeshPhongMaterial({color: 0x600000, emissive: 0xFF0000, specular: 0x505050, shininess: 100, shading: THREE.SmoothShading  });
             var sensorLEDMesh = new THREE.Mesh(sensorLEDg, this.sensorLEDMat);
             var sensorBoxg = new THREE.CubeGeometry(8, 5, 5);
             var sensorBoxMat =  new THREE.MeshPhongMaterial({color: 0x000000, specular: 0x505050, shininess: 100, shading: THREE.SmoothShading  });
             var sensorBoxMesh = new THREE.Mesh(sensorBoxg, sensorBoxMat);
             for(var n = 0; n < this.NumberOfSensors; n++){
                 var sensorN = sensorLEDMesh.clone();
                 sensorN.rotateX(-Math.PI/2);
                 sensorN.position.set(this.robotLength, (n - (this.NumberOfSensors-1.0)/2.0)*this.SensorSpacing, -11.5);
                 this.sensors.push(sensorN);
                 this.add(this.sensors[n]);
                 var sensorBoxN = sensorBoxMesh.clone();
                 sensorBoxN.position.set(this.robotLength, (n - (this.NumberOfSensors-1.0)/2.0)*this.SensorSpacing, -7);
                 this.add(sensorBoxN);
             }
//             this.rotateX(Math.PI);

             this.isLoaded = true;  
         }.bind(this) , function() {});       
    }
}

export { RobotShape }; 