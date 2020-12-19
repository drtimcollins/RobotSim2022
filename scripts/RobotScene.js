// RobotScene - handles track and lighting
class RobotScene extends THREE.Scene{
    constructor(params){
        super();
        this.background = new THREE.Color(0xE0F0FF);
        this.lights = [];
        this.width = params.width;
        this.height = params.height;
        this.isLoaded = false;

        for(var n = 0; n < 4; n++){
            var light = new THREE.SpotLight( 0xffffff, 0.1, 0, 0.5, 0.1, 1.5);
            light.angle = Math.PI / 4;
            light.distance = 5000;
    
            light.position.set( (n%2)*params.width, Math.floor(n/2)*params.height, -1200);
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
            this.lights[n].target.position.set(params.width/2, params.height/2,0);
        }
        this.add( new THREE.AmbientLight(0xC8C8C8));


        this.trackMesh = new THREE.Group();
        // White Base
        var g = new THREE.Geometry();
        g.vertices.push(new THREE.Vector3(0,0,0.5));
        g.vertices.push(new THREE.Vector3(0,params.height,0.5));
        g.vertices.push(new THREE.Vector3(params.width,params.height,0.5));
        g.vertices.push(new THREE.Vector3(params.width,0,0.5));
        g.faces.push(new THREE.Face3(0,2,3));
        g.faces.push(new THREE.Face3(2,0,1));
        g.computeFaceNormals();    
        var material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        var baseMesh = new THREE.Mesh(g, material);
        baseMesh.receiveShadow = true;
        baseMesh.castShadow = true;
        this.trackMesh.add(baseMesh);



        this.trackMesh.add(this.makeStartFinish(params.sf));


        
        // Track
        var loader = new THREE.PLYLoader();        
//        loader.load('img/twistyTrack.ply', function(geometry) {
//        loader.load('img/hairPinTrack.ply', function(geometry) {
        loader.load('img/simpleTrack.ply', function(geometry) {
            geometry.computeFaceNormals();
            var trackMat = new THREE.MeshLambertMaterial({color: 0x000000});
            this.trackLine = new THREE.Mesh(geometry, trackMat);
            this.trackLine.receiveShadow = true;
            //this.trackLine.castShadow = true;
            this.trackMesh.add(this.trackLine);
            this.add(this.trackMesh);
            this.isLoaded = true;
        }.bind(this) , function() {});  
    }    

    getSensorOutput(x, y){
        if(x < 0 || y < 0 || x > this.width || y > this.height || !this.isLoaded)
            return 0;   
        else{
            const Nv = this.trackLine.geometry.vertices.length;
            for(let n = 0; n < Nv/2; n++){
                if(this.isInQuad(x, y, n*2, n*2+1, (n*2+3)%Nv, (n*2+2)%Nv))
                    return 0xFFFFFF;
            }
            return 0;
        }
    }
    isInQuad(x, y, i0, i1, i2, i3){
        let d0 = this.signFn(x, y, this.trackLine.geometry.vertices[i0], this.trackLine.geometry.vertices[i1]);
        let d1 = this.signFn(x, y, this.trackLine.geometry.vertices[i1], this.trackLine.geometry.vertices[i2]);
        let d2 = this.signFn(x, y, this.trackLine.geometry.vertices[i2], this.trackLine.geometry.vertices[i3]);
        let d3 = this.signFn(x, y, this.trackLine.geometry.vertices[i3], this.trackLine.geometry.vertices[i0]);
        return (d0==d1 && d1==d2 & d2==d3);
    }
    signFn(x, y, p2, p3){
        return ((x-p3.x)*(p2.y-p3.y)-(p2.x-p3.x)*(y-p3.y) > 0) ? 1 : -1;
    }
    makeStartFinish(sf){
        this.startFinish = new THREE.Group();

        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array( [-8,  32, 0, 8, 32, 0, 8,  -32, 0, -8,  -32, 0, -8,  32, 0]);        
        geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        const line = new THREE.Line( geometry, new THREE.MeshLambertMaterial( { color: 0x000000 } ) );
        this.startFinish.add(line);



        // Black/White Square
        const g = new THREE.Geometry();
        g.vertices.push(new THREE.Vector3(0,0,0));
        g.vertices.push(new THREE.Vector3(0,8,0));
        g.vertices.push(new THREE.Vector3(8,8,0));
        g.vertices.push(new THREE.Vector3(8,0,0));
        g.faces.push(new THREE.Face3(0,2,3));
        g.faces.push(new THREE.Face3(2,0,1));
        g.computeFaceNormals();    
        const bSquare = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0x000000 }));
        bSquare.receiveShadow = true;
        const wSquare = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0xFFFFFF }));
        wSquare.receiveShadow = true;

        var s;
        for(var n = 0; n < 8; n++){
            s = bSquare.clone();
            s.position.set(0-8*(n%2),n*8-32,0);
            this.startFinish.add(s.clone());
            s = wSquare.clone();
            s.position.set(-8+(n%2)*8,n*8-32,0);
            this.startFinish.add(s.clone());
        }



/*
        const points = [];
        points.push( new THREE.Vector3( -8,  32, 0 ));
        points.push( new THREE.Vector3( 8,  32, 0 ));
        points.push( new THREE.Vector3(  8, -32, 0 ));
        points.push( new THREE.Vector3( -8, -32, 0 ));        
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, new THREE.LineBasicMaterial({color: 0x0000ff}) );
        this.startFinish.add(line);
*/


/*        geometry.faces.push( new THREE.Face4( 0, 2, 3) );
        geometry.faces.push( new THREE.Face4( 0, 1, 2) );
        geometry.faces[0].color = new THREE.Color( 0x00FF00 );
        geometry.faces[1].color = new THREE.Color( 0x00FF00 );
        this.startFinish = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( {color: 0xffffff,vertexColors: THREE.FaceColors}));
        */
        this.startFinish.position.set(sf.x,sf.y,-.15);
        return(this.startFinish);
    }
}

export { RobotScene }; 