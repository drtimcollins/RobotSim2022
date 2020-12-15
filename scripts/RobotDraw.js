// RobotDraw using three.js
import { RobotScene } from './RobotScene.js';
import { RobotSim } from './RobotSim.js';
import { RobotGui } from './RobotGui.js';
import { SmartCam } from './SmartCam.js';
//import * as THREE from './three.module.js';

var camera, scene, renderer;
var gui;
//var trackMesh;
//var trackWidth = 1180, trackHeight = 834;

const sceneParams = {width:1280, height:720};

//var trackWidth = 1280, trackHeight = 720;
var robot;

// Start-up initialisation
$(function(){
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.id = "threeDrenderer"
//    renderer.autoClear = false;

    scene = new RobotScene(sceneParams);   
//    hud = new RobotHud(sceneParams);
    robot = new RobotSim(scene);    
    camera = new SmartCam(scene, robot);
//    cameraHUD = new THREE.OrthographicCamera(-sceneParams.width/2, sceneParams.width/2, sceneParams.height/2, -sceneParams.height/2, 0, 30 );
    $("#renderWin").append(renderer.domElement);   

    gui = new RobotGui();

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
        $("#renderWin").height($("#renderWin").width()*sceneParams.height/sceneParams.width);
        renderer.setSize($("#renderWin").width(), $("#renderWin").height());
    }
    if(gui != null){
        gui.resize($("#renderWin").width());
    }
}

function updateCameraMode(mode){
    switch(mode){
        case 'topview'       : camera.change(0); break;
        case 'topviewClose'  : camera.change(1); break;
        case 'sideview'      : camera.change(2); break;        
        case 'sideviewClose' : camera.change(3); break;        
        case 'thirdPerson'   : camera.change(4); break;
        case 'driver'        : camera.change(5); break;
    }
}

window.updateCameraMode = updateCameraMode;



