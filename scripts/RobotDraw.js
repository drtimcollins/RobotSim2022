// RobotDraw using three.js
import { RobotScene } from './RobotScene.js';
import { RobotSim } from './RobotSim.js';
import { SmartCam } from './SmartCam.js';
//import * as THREE from './three.module.js';

var camera, scene, renderer;
var two;
//var trackMesh;
//var trackWidth = 1180, trackHeight = 834;

const sceneParams = {width:1280, height:720};
const guiAR = 4.0;
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

    two = new Two({width:sceneParams.width,height:sceneParams.width/guiAR,type:Two.Types.canvas}).appendTo(document.getElementById('guiWin'));

    var circle = two.makeCircle(72, 100, 50);    
    circle.fill = '#FF8000';
    circle.stroke = 'orangered'; // Accepts all valid css color
    circle.linewidth = 5;

    onResize();
    update(0);

    two.update();
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
    if(two != null){
        two.height = $("#renderWin").width()/guiAR;
        two.width = $("#renderWin").width();
        two.scene.scale = $("#renderWin").width()/sceneParams.width;
        two.update();
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



