// RobotDraw using three.js
import { RobotScene } from './RobotScene.js';
import { RobotSim } from './RobotSim.js';
import { RobotGui } from './RobotGui.js';
import { SmartCam } from './SmartCam.js';

const dispMode = {DESIGN:1, CODE:2, RACE:3};
var dmode = dispMode.DESIGN;

var camera, scene, renderer, gui;

const sceneParams = {width:1280, height:720, sf:{x:640,y:643}};

var robot;
var clk;

// Start-up initialisation
$(function(){
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.id = "threeDrenderer"

    scene = new RobotScene(sceneParams);   
    robot = new RobotSim(scene, sceneParams.sf);    
    camera = new SmartCam(scene, robot);
    $("#renderWin").append(renderer.domElement);   

    gui = new RobotGui();

    clk = new THREE.Clock(false);

    onResize();
    update(0);
});

$(document).ready(function(){
    $(window).resize(function(){console.log("Resize");onResize();});
});

function update() {
    gui.timers[0].setTime(clk.getElapsedTime() * 1000.0);

    camera.update();
    if(robot.isLoaded()){
        if(!clk.running) clk.start();
        robot.move();
        robot.update();
    }
    renderer.render( scene, camera );

    requestAnimationFrame( update );
}

function onResize(){
    const w = $("#renderWin").width();
    if(renderer != null){
        $("#renderWin").height(w*sceneParams.height/sceneParams.width);
        renderer.setSize(w, $("#renderWin").height());
    }
    if(gui != null){
        gui.resize(w);
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



