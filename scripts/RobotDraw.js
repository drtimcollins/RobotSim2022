// RobotDraw using three.js
//import { RobotShape } from './RobotShape.js';
import { RobotScene } from './RobotScene.js';
import { RobotSim } from './RobotSim.js';
//import * as THREE from './three.module.js';

var camera, scene, renderer;
//var trackMesh;
//var trackWidth = 1180, trackHeight = 834;
var trackWidth = 1280, trackHeight = 720;
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

    camTarget = new THREE.Mesh( new THREE.CubeGeometry(.1,.1,.1));
    camTarget.position.set(trackWidth/2, trackHeight/2,0);
    scene.add(camTarget);

    const fov = 40;
    camera = new THREE.PerspectiveCamera(fov, trackWidth/trackHeight, 1, 2000);
    camera.position.set(trackWidth/2, trackHeight/2, -trackHeight/2/Math.tan(fov*Math.PI/360.0));  // Overhead view
    //camera.position.set(trackWidth/2, trackHeight/2, -trackHeight/2/Math.tan(30.0*Math.PI/180.0));  // Overhead view
    //camera.position.set(trackWidth/2, trackHeight, -600);  // Side 3D view
    //camera.position.set(trackWidth/2, 500, -150);  // Side 3D view
    //camera.position.set(trackWidth/2, 100+trackHeight, -100);  // Side 3D view
    camera.lookAt( camTarget.position );
    camera.rotateZ(Math.PI);

    $("#renderWin").append(renderer.domElement);   

    robot = new RobotSim(scene);    

    onResize();
    update(0);
});

$(document).ready(function(){
    $(window).resize(function(){console.log("Resize");onResize();});
});

var then = 0;
function update(now) {
    const dtime = now - then;
    then = now;
//    $("#debugtext").text(dtime);

    if(robot.isLoaded()){
        robot.move();
        robot.update();
    }
    renderer.render( scene, camera );

    requestAnimationFrame( update );
}

function onResize(){
    if(renderer != null){
    $("#renderWin").height($("#renderWin").width()*trackHeight/trackWidth);
    renderer.setSize($("#renderWin").width(), $("#renderWin").height());
    }
}



