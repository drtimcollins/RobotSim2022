// RobotScene - handles track and lighting
class RobotScene extends THREE.Scene{
    constructor(params){
        super();
        this.background = new THREE.Color(0xE0F0FF);
        this.lights = [];
        for(var n = 0; n < 4; n++){
            var light = new THREE.SpotLight( 0xffffff, 0.1, 0, 0.5, 0.1, 1.5);
            light.angle = Math.PI / 4;
            light.distance = 5000;
    
            light.position.set( (n%2)*params.trackWidth, Math.floor(n/2)*params.trackHeight, 1200);
            light.castShadow = true;        
            light.shadow.mapSize = new THREE.Vector2(1024,1024);
            light.shadow.darkness = 0x808080;
            var dd = 1500;
            light.shadow.camera.far = 5000;
            light.shadow.camera.left = -dd;
            light.shadow.camera.right = dd;
            light.shadow.camera.top = dd;
            light.shadow.camera.bottom = -dd;
            light.shadow.camera.near = 100;
            light.shadow.radius = 3;
            this.add( light );
            this.add(light.target);
            this.lights.push(light);
            this.lights[n].target.position.set(params.trackWidth/2, params.trackHeight/2,0);
        }
        this.add( new THREE.AmbientLight(0xC8C8C8));


        this.trackMesh = new THREE.Group();
        // White Base
        var g = new THREE.Geometry();
        g.vertices.push(new THREE.Vector3(0,0,-0.5));
        g.vertices.push(new THREE.Vector3(0,params.trackHeight,-0.5));
        g.vertices.push(new THREE.Vector3(params.trackWidth,params.trackHeight,-0.5));
        g.vertices.push(new THREE.Vector3(params.trackWidth,0,-0.5));
        g.faces.push(new THREE.Face3(0,3,2));
        g.faces.push(new THREE.Face3(2,1,0));
        g.computeFaceNormals();    
        var material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        var baseMesh = new THREE.Mesh(g, material);
        baseMesh.receiveShadow = true;
        baseMesh.castShadow = true;
        this.trackMesh.add(baseMesh);

        // Track
        var loader = new THREE.PLYLoader();
        loader.load('img/skewTrack.ply', function(geometry) {
            geometry.computeFaceNormals();
            var trackMat = new THREE.MeshLambertMaterial({color: 0x000000});
            this.trackLine = new THREE.Mesh(geometry, trackMat);
            //this.trackMesh.rotateX(Math.PI);
            this.trackLine.receiveShadow = true;
            this.trackLine.castShadow = true;
            this.trackMesh.add(this.trackLine);
            this.add(this.trackMesh);
        }.bind(this) , function() {});  

 /*
        var textureLoader = new THREE.TextureLoader();    
        var g = new THREE.Geometry();
        g.vertices.push(new THREE.Vector3(0,0,0));
        g.vertices.push(new THREE.Vector3(0,params.trackHeight,0));
        g.vertices.push(new THREE.Vector3(params.trackWidth,params.trackHeight,0));
        g.vertices.push(new THREE.Vector3(params.trackWidth,0,0));
        g.faces.push(new THREE.Face3(0,3,2));
        g.faces.push(new THREE.Face3(2,1,0));
        g.faceVertexUvs[0].push([new THREE.Vector2(0,0), new THREE.Vector2(1,0), new THREE.Vector2(1,1)]);    
        g.faceVertexUvs[0].push([new THREE.Vector2(1,1), new THREE.Vector2(0,1), new THREE.Vector2(0,0)]);    
        g.computeFaceNormals();
    
        var material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        textureLoader.load(params.path, function(texture) { // OnLoad function
                material.map = texture;
                this.trackMesh = new THREE.Mesh(g, material);
                this.trackMesh.receiveShadow = true;
                this.trackMesh.castShadow = true;
                this.add(this.trackMesh);
            }.bind(this), undefined, function(){
            alert('Map load error');
        });
        */
    }    
}

export { RobotScene }; 