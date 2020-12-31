// RobotDraw using three.js
import { RobotScene } from './RobotScene.js';
import { RobotSim } from './RobotSim.js';
import { RobotGui } from './RobotGui.js';
import { SmartCam } from './SmartCam.js';
import { RobotCompiler } from './RobotCompiler.js';

const dispMode = {DESIGN:1, CODE:2, RACE:3};
var dmode = dispMode.DESIGN;

var camera, scene, renderer, gui, clk, cpp;

//const sceneParams = {width:1280, height:720, sf:{x:640,y:643}};
const sceneParams = {width:1280, height:720, sf:{x:640,y:597}};
var robotParams = {
    width: 100,
    length: 130,
    NumberOfSensors: 2,
    SensorSpacing: 15};
var robot;
var rec;
var editor;

// Start-up initialisation
$(function(){
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/eclipse");
    editor.session.setMode("ace/mode/c_cpp");
    editor.setShowPrintMargin(false);	

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.id = "threeDrenderer"

    scene = new RobotScene(sceneParams, onTrackLoaded);   
    robot = new RobotSim(scene, sceneParams.sf, robotParams);    
    camera = new SmartCam(scene, robot);
    $("#renderWin").append(renderer.domElement);   

    clk = new THREE.Clock(false);
    gui = new RobotGui();
    cpp = new RobotCompiler();
    $('#runButton').prop('disabled', true);

    onResize();
    update(0);
});

$(document).ready(function(){
    $(window).resize(function(){console.log("Resize");onResize();});
});

function onTrackLoaded(){
    console.log("Track Loaded");
    cpp.init({track: scene.trackLine.geometry.vertices,
              start: sceneParams.sf,
              robot: robotParams});
    $('#runButton').prop('disabled', false);
}

function update() {
    gui.timers[0].setTime(Math.max(clk.getElapsedTime() * 1000.0 - 1000.0, 0));    // 1 second start 'countdown'

    if(dmode == dispMode.RACE && robot.isLoaded()){
        if(!clk.running) clk.start();

        robot.play(rec, clk.getElapsedTime() * 50.0 - 50.0);      // 1 second start 'countdown', 50 fps recording
    }
    camera.update();
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

function runCode(){
    console.log("RUN CODE");
    if(cpp.isInit)
    cpp.exe(editor.getValue(), function(recStr){
        let recItems = recStr.split(/\r?\n/);
        rec = [];
        recItems.forEach(rItem => {
            let recDat = rItem.split(' ');
            if(recDat.length == 8+cpp.bot.NumberOfSensors){
                let pose = {xy: math.Complex(parseFloat(recDat[0]),parseFloat(recDat[1])), 
                    bearing: math.Complex(parseFloat(recDat[2]),parseFloat(recDat[3])),
                    L: math.Complex(parseFloat(recDat[4]),parseFloat(recDat[5])),
                    R: math.Complex(parseFloat(recDat[6]),parseFloat(recDat[7])), 
                    an: new Array(cpp.bot.NumberOfSensors)};                
                for(var n = 0; n < cpp.bot.NumberOfSensors; n++)
                    pose.an[n] = (recDat[8+n] == "0") ? 0 : 0xFFFFFF;
                rec.push({pose: $.extend(true,{},pose)});
            }
        });

        dmode = dispMode.RACE;
        robot.shape.visible = true;
    });
}

window.updateCameraMode = updateCameraMode;
window.runCode = runCode;


