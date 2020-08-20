// RobotDraw using three.js

var container, camera, scene, renderer;
var trackMesh;
var Rw, Lw;
var trackWidth = 1180, trackHeight = 834;
//var light, lightHelp;
var camTarget;
//var shhelper;
var lights = [];

// Start-up initialisation
$(function(){
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    //renderer.shadowMapSoft = true;    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.id = "threeDrenderer"

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE0E0E0);
    for(var n = 0; n < 4; n++){
        var light = new THREE.SpotLight( 0xffffff, 0.15, 0, 0.5, 0.1, 1.5);
        light.angle = Math.PI / 4;
        light.distance = 5000;

        light.position.set( (n%2)*trackWidth, Math.floor(n/2)*trackHeight, 1200);
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
        scene.add( light );
        scene.add(light.target);
        lights.push(light);
    }
    scene.add( new THREE.AmbientLight(0xB0B0B0));

    addTrack(scene, {w:trackWidth, h:trackHeight, path:'img/Test Track 2018.png'});
    addWheel();

    camTarget = new THREE.Mesh( new THREE.CubeGeometry(1,1,1));
    camTarget.position.set(trackWidth/2, trackHeight/2,0);
    scene.add(camTarget);

    camera = new THREE.PerspectiveCamera(60, trackWidth/trackHeight, 1, 2000);
//    camera.position.set(trackWidth/2, trackHeight/2, trackHeight/2/Math.tan(30.0*Math.PI/180.0));  // Overhead view
    camera.position.set(trackWidth/2, 0, 600);  // Side 3D view
//    camera.position.set(trackWidth/2, 100, 100);  // Side 3D view
//    camera.position.set(trackWidth/2, -500, 600);  // Side 3D view
//    camera.lookAt(new THREE.Vector3(trackWidth/2, trackHeight/2, 0));
    camera.lookAt( camTarget.position );
    for(var n = 0; n < lights.length; n++)
        lights[n].target.position.set(trackWidth/2, trackHeight/2,0);

    $("#renderWin").append(renderer.domElement);   

    onResize();
    update();
});

$(document).ready(function(){
    $(window).resize(function(){console.log("Resize");onResize();});
});


function update() {
    requestAnimationFrame( update );
    if(Rw != null){
        Rw.rotation.z += .05;
    }
    if(Lw != null){
        Lw.rotation.z += .05;
    }
    renderer.render( scene, camera );
}

function onResize(){
    if(renderer != null){
    $("#renderWin").height($("#renderWin").width()*trackHeight/trackWidth);
    renderer.setSize($("#renderWin").width(), $("#renderWin").height());
    }
}

function addTrack(myscene, trackInfo){
    var textureLoader = new THREE.TextureLoader();    
    var g = new THREE.Geometry();
    g.vertices.push(new THREE.Vector3(0,0,0));
    g.vertices.push(new THREE.Vector3(0,trackInfo.h,0));
    g.vertices.push(new THREE.Vector3(trackInfo.w,trackInfo.h,0));
    g.vertices.push(new THREE.Vector3(trackInfo.w,0,0));
    g.faces.push(new THREE.Face3(0,3,2));
    g.faces.push(new THREE.Face3(2,1,0));
    g.faceVertexUvs[0].push([new THREE.Vector2(0,0), new THREE.Vector2(1,0), new THREE.Vector2(1,1)]);    
    g.faceVertexUvs[0].push([new THREE.Vector2(1,1), new THREE.Vector2(0,1), new THREE.Vector2(0,0)]);    
    g.computeFaceNormals();
    //g.computeVertexNormals();

//    var g = new THREE.CubeGeometry(trackInfo.w, trackInfo.h, 0.01);

    var material = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF
     });
    textureLoader.load(trackInfo.path, function(texture) {
        // OnLoad function
       material.map = texture;
       trackMesh = new THREE.Mesh(g, material);
       trackMesh.receiveShadow = true;
//       trackMesh.position.set(trackInfo.w/2, trackInfo.h/2, -0.01);
       trackMesh.castShadow = true;
       myscene.add(trackMesh);
    }, undefined, function(){
        alert('Map load error');
    });
/*    trackMesh = new THREE.Mesh(g, material);
    trackMesh.receiveShadow = true;
    trackMesh.castShadow = true;
    trackMesh.position.set(new THREE.Vector3(trackInfo.w/2, trackInfo.h/2, -0.01));
    myscene.add(trackMesh);*/
}

function addWheel(){
    var loader = new THREE.PLYLoader();
    loader.load('img/wheel.ply', function(geometry) {
       geometry.computeFaceNormals();
  //     geometry.computeVertexNormals();
//       var material = new THREE.MeshBasicMaterial({color : 0xff0000});
       var material = new THREE.MeshLambertMaterial({
          reflectivity: 1,
          //shading: THREE.SmoothShading,
          color: 0x444444
       });
        Rw = new THREE.Mesh(geometry, material);
        Rw.rotateX(Math.PI/2);
        Lw = Rw.clone();
//        Rw.translateZ(50);
        Rw.position.set(550,300,20);
        Lw.position.set(550,200,20);
        Rw.castShadow=true;
        Lw.castShadow=true;
    //    Rw.receiveShadow=true;
    //    Lw.receiveShadow=true;
        scene.add(Lw);    
        scene.add(Rw);    
    }, function() {});
}