// RobotDraw using three.js
import { RobotShape } from './RobotShape.js';
import { RobotScene } from './RobotScene.js';
//import * as THREE from './three.module.js';

var camera, scene, renderer;
//var trackMesh;
var trackWidth = 1180, trackHeight = 834;
var camTarget;

var robot;

// Start-up initialisation
$(function(){
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    //renderer.shadowMapSoft = true;    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.id = "threeDrenderer"

    scene = new RobotScene({trackWidth:trackWidth, trackHeight:trackHeight, path:'img/Test Track 2018.png'});

    camTarget = new THREE.Mesh( new THREE.CubeGeometry(1,1,1));
    camTarget.position.set(trackWidth/2, trackHeight/2,0);
    scene.add(camTarget);

    camera = new THREE.PerspectiveCamera(60, trackWidth/trackHeight, 1, 2000);
//    camera.position.set(trackWidth/2, trackHeight/2, trackHeight/2/Math.tan(30.0*Math.PI/180.0));  // Overhead view
    //camera.position.set(trackWidth/2, 0, 600);  // Side 3D view
    camera.position.set(trackWidth/2, 50, 150);  // Side 3D view
//    camera.position.set(trackWidth/2, -500, 600);  // Side 3D view
//    camera.lookAt(new THREE.Vector3(trackWidth/2, trackHeight/2, 0));
    camera.lookAt( camTarget.position );

    $("#renderWin").append(renderer.domElement);   

    robot = new RobotShape();
    robot.position.set(600,450,0);
    scene.add(robot);

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
        robot.rotation.z +=.01;
}
    renderer.render( scene, camera );
}

function onResize(){
    if(renderer != null){
    $("#renderWin").height($("#renderWin").width()*trackHeight/trackWidth);
    renderer.setSize($("#renderWin").width(), $("#renderWin").height());
    }
}



