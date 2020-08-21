// RobotDraw using three.js
import { RobotShape } from './RobotShape.js';

var container, camera, scene, renderer;
var trackMesh;
var trackWidth = 1180, trackHeight = 834;
var camTarget;
var lights = [];

var robot;

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
        var light = new THREE.SpotLight( 0xffffff, 0.1, 0, 0.5, 0.1, 1.5);
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
    scene.add( new THREE.AmbientLight(0xC8C8C8));

    addTrack(scene, {w:trackWidth, h:trackHeight, path:'img/Test Track 2018.png'});

    robot = new RobotShape();
    robot.position.set(600,250,0);
    scene.add(robot);


    camTarget = new THREE.Mesh( new THREE.CubeGeometry(1,1,1));
    camTarget.position.set(trackWidth/2, trackHeight/2,0);
    scene.add(camTarget);

    camera = new THREE.PerspectiveCamera(60, trackWidth/trackHeight, 1, 2000);
//    camera.position.set(trackWidth/2, trackHeight/2, trackHeight/2/Math.tan(30.0*Math.PI/180.0));  // Overhead view
//    camera.position.set(trackWidth/2, 0, 600);  // Side 3D view
    camera.position.set(trackWidth/2, -0, 100);  // Side 3D view
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

var counter = 0;

function update() {
    requestAnimationFrame( update );
    counter++;
    if(robot.isLoaded){
        robot.sensors[Math.floor(counter/100)%4].material = robot.sensorLEDMatOn;           
        robot.Rw.rotation.z += .05;
        robot.Lw.rotation.z += .05;
        robot.rotation.z = 4;
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

    var material = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF
     });
    textureLoader.load(trackInfo.path, function(texture) {
        // OnLoad function
       material.map = texture;
       trackMesh = new THREE.Mesh(g, material);
       trackMesh.receiveShadow = true;
       trackMesh.castShadow = true;
       myscene.add(trackMesh);
    }, undefined, function(){
        alert('Map load error');
    });
}

