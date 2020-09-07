// RobotDraw using three.js
import { RobotScene } from './RobotScene.js';
import { RobotSim } from './RobotSim.js';
import { SmartCam } from './SmartCam.js';
//import * as THREE from './three.module.js';

var camera, scene, renderer;
//var trackMesh;
//var trackWidth = 1180, trackHeight = 834;
var trackWidth = 1280, trackHeight = 720;
var robot;

// Start-up initialisation
$(function(){
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.id = "threeDrenderer"

    scene = new RobotScene({trackWidth:trackWidth, trackHeight:trackHeight, path:'img/Test Track 2018.png'});
   
    robot = new RobotSim(scene);    
    camera = new SmartCam(scene, robot);

    $("#renderWin").append(renderer.domElement);   

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

    camera.update();
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

function updateCameraMode(mode){
    switch(mode){
        case 'topview'    : camera.phiTarget = 0; camera.onBoardTarget = 0; break;
        case 'sideview'   : camera.phiTarget = 50; camera.onBoardTarget = 0; break;        
        case 'follow'     : camera.followTarget = $("#followBox").is(':checked') ? 1 : 0; camera.onBoardTarget = 0; break;
        case 'thirdPerson': camera.phiTarget = 70; camera.onBoardTarget = 1; break;
    }
}

window.updateCameraMode = updateCameraMode;



