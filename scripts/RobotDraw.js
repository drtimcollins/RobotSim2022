// RobotDraw using three.js
var MAXSENSORS = 10;

import { RobotScene } from './RobotScene.js';
import { RobotSim } from './RobotSim.js';
import { RobotGui } from './RobotGui.js';
import { SmartCam } from './SmartCam.js';
import { RobotCompiler } from './RobotCompiler.js';

const dispMode = {DESIGN:1, CODE:2, RACE:3};
var dmode = dispMode.DESIGN;

var camera, scene, renderer, gui, clk, cpp;

//const sceneParams = {width:1280, height:720, sf:{x:640,y:643}, name:'simpleTrack'};
//const sceneParams = {width:1280, height:720, sf:{x:640,y:597}, name:'basicTrack'};
const sceneParams = {width:1280, height:720, sf:{x:640,y:663}, name:'hairPinTrack'};
//const sceneParams = {width:1280, height:720, sf:{x:640,y:663}, name:'twistyTrack'};
//const sceneParams = {width:1280, height:720, sf:{x:640,y:80}, name:'uTrack'};

var robotParams = {
    width: 90,
    length: 120,
    NumberOfSensors: 2,
    SensorSpacing: 15};
var robot;
var rec;
var editor;
var sliderLength, sliderWidth, sliderSpacing, sliderNumSensors;

// Start-up initialisation
$(function(){
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/eclipse");
    editor.session.setMode("ace/mode/c_cpp");
    editor.setShowPrintMargin(false);	

   
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.id = "threeDrenderer"

    scene = new RobotScene(sceneParams, onTrackLoaded);   
    robot = new RobotSim(scene, sceneParams.sf, robotParams);    
    camera = new SmartCam(scene, robot);
    camera.change(4);
    $("#renderWin").append(renderer.domElement);   

    sliderLength = document.querySelector('#sliderLength');
    sliderWidth = document.querySelector('#sliderWidth');
    sliderSpacing = document.querySelector('#sliderSpacing');
    sliderNumSensors = document.querySelector('#sliderNumSensors');
    new Powerange(sliderLength, { decimal: true, callback: function(){
            $('#sliderLengthBox').prop('innerHTML',sliderLength.value);
            robotParams.length = parseFloat(sliderLength.value);
            robot.shape.setSize(robotParams);
        }, max: 250, min: 50, start: 120 });
    new Powerange(sliderWidth, { decimal: true, callback: function(){
            $('#sliderWidthBox').prop('innerHTML',sliderWidth.value);
            robotParams.width = parseFloat(sliderWidth.value);
            robot.shape.setSize(robotParams);
        }, max: 240, min: 20, start: 90 });
    new Powerange(sliderSpacing, { decimal: true, callback: function(){
            $('#sliderSpacingBox').prop('innerHTML',sliderSpacing.value);
            robotParams.SensorSpacing = parseFloat(sliderSpacing.value);
            robot.shape.setSize(robotParams);
        }, max: 50, min: 10, start: 15 });
    new Powerange(sliderNumSensors, { callback: function(){
            $('#sliderNumSensorsBox').prop('innerHTML',sliderNumSensors.value);
            robotParams.NumberOfSensors = parseInt(sliderNumSensors.value);
            robot.shape.setSize(robotParams);
        }, max: MAXSENSORS, min: 1, start: 2 });

    clk = new THREE.Clock(false);
    gui = new RobotGui();
    cpp = new RobotCompiler();
    $('#runButton').prop('disabled', true);
    $('#guiWin').hide();

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
    // Set visibility
    scene.trackMesh.visible = (dmode == dispMode.RACE);
    scene.gridHelper.visible = scene.turntableTop.visible = scene.turntable.visible = !(dmode == dispMode.RACE);
    scene.background = scene.bgList[(dmode == dispMode.RACE)?1:0];

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
    {
        cpp.bot = robotParams;
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

            $('#guiWin').show();
            camera.change(0);
            dmode = dispMode.RACE;
            robot.shape.visible = true;
        });
    }
}

window.updateCameraMode = updateCameraMode;
window.runCode = runCode;

export{MAXSENSORS};
