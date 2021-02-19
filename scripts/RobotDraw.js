// RobotDraw using three.js
var MAXSENSORS = 10;

import { RobotScene } from './RobotScene.js';
import { RobotSim } from './RobotSim.js';
import { RobotGui } from './RobotGui.js';
import { SmartCam } from './SmartCam.js';
import { RobotCompiler } from './RobotCompiler.js';

const dispMode = {DESIGN:1, RACE:2};
var dmode = dispMode.DESIGN;

var camera, scene, renderer, gui, clk, cpp;

//const sceneParams = {width:1280, height:720, sf:{x:640,y:643}, name:'simpleTrack'};
const sceneParams = {width:1280, height:720, sf:{x:640,y:597}, name:'basicTrack'};
//const sceneParams = {width:1280, height:720, sf:{x:640,y:663}, name:'hairPinTrack'};
//const sceneParams = {width:1280, height:720, sf:{x:640,y:663}, name:'twistyTrack'};
//const sceneParams = {width:1280, height:720, sf:{x:640,y:80}, name:'uTrack'};

var robotParams = {
    width: 90,
    length: 120,
    NumberOfSensors: 2,
    SensorSpacing: 15};
var robot;
var rec;
var laps;
var editor;
var sliderLength, sliderWidth, sliderSpacing, sliderNumSensors;

// Start-up initialisation
$(function(){
    $('#progress').hide();
    
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
    camera.change(6);
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
    gui = new RobotGui(onIconClicked);
    cpp = new RobotCompiler();
    $('#runButton').prop('disabled', true);
    $('#guiWin').hide();

/*    var propos = $("#renderWin").offset().top;*/

//	 $("#progress").show();

    onResize();
    update(0);
});

$(document).ready(function(){
    $(window).resize(function(){console.log("Resize");onResize();});
});

function onIconClicked(i){
    console.log(i + " pressed");
    const index = parseInt(i.substring(4));
    if(index < 3){
        gui.camMode = index;
        camera.change(gui.camMode * 2 + gui.camZoom);
    }
    else if(index < 5){
        gui.camZoom = index - 3;
        camera.change(gui.camMode * 2 + gui.camZoom);
    }
    else {
        camera.change(6);
        $('#guiWin').hide();
        $('#designerWin').show();         
        dmode = dispMode.DESIGN;
        update(0);        
    }

    gui.refillIcons();
}

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

    if(clk.getElapsedTime() <= 61.0 && dmode == dispMode.RACE){
        let frameCount = clk.getElapsedTime() * 50.0 - 50.0; // 1 second start 'countdown'
        let lapTime = 0;
        let lapStart = 0;
        laps.forEach(lapn=>{ if(frameCount > lapn){
            lapTime = lapn - lapStart;
            lapStart = lapn;
        }}); 
        gui.timers[1].setTime(lapTime * 20.0);   
        gui.timers[0].setTime(Math.max((frameCount-lapStart) * 20.0, 0));   
    }
    else
        gui.timers[0].setTime(0);

    if(robot.isLoaded()){
        if(!clk.running) clk.start();
        if(dmode == dispMode.RACE){
            robot.play(rec, clk.getElapsedTime() * 50.0 - 50.0);      // 1 second start 'countdown', 50 fps recording
        } else { // DESIGN mode
            robot.designShow(clk.getElapsedTime() * 50.0);
        }
    }

    camera.update();
    renderer.render( scene, camera );

    requestAnimationFrame( update );
}

function onResize(){
    const w = $("#renderWin").width();
    const pw = $("#progress").width();
    if(renderer != null){
        $("#renderWin").height(w*sceneParams.height/sceneParams.width);
        renderer.setSize(w, $("#renderWin").height());
    }
    if(gui != null){
        gui.resize(w);
    }
    $("#progress").offset({        
        top: ($("#renderWin").offset().top + $("#renderWin").height()/4)       
	 }); 
}

function runCode(){
    $('#progress').show();
    console.log("RUN CODE");
    if(cpp.isInit)
    {        
        cpp.updateParams(robotParams);
        cpp.exe(editor.getValue(), function(data){
            if(data.Errors == null){
                $('#coutBox').text(data.Stats);
                const recStr = data.Result;
                let recItems = recStr.split(/\r?\n/);
                rec = [];
                laps = [];
                recItems.forEach(rItem => {
                    let recDat = rItem.split(' ');
                    if(recDat.length == 2){
                        laps.push(parseInt(recDat[1]));
                    } else if(recDat.length == 8+cpp.bot.NumberOfSensors){
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
                clk.stop();
                clk.elapsedTime = 0;
                console.log(clk.getElapsedTime());
                $('#guiWin').show();
                $('#designerWin').hide();            
                camera.change(gui.camMode * 2 + gui.camZoom);                
                dmode = dispMode.RACE;
                //robot.shape.visible = true;
            } else { // Report Errors
                //var ln = data.Errors.search(/source.cpp:\d+:/g);

                var errs = data.Errors;
                var regex = /source.cpp:(\d+):/g
                var match;
                while ((match = regex.exec(errs)) != null) {
                    let ln = parseInt(match[1]) - 110;
                    errs = errs.substr(0,match.index+11)+ln.toString()+errs.substr(match.index+11+match[1].length);
                    regex.lastIndex += match[1].length - ln.toString().length;
                }
                $('#coutBox').text('Program Build Failed\n'+errs);
            }
            $('#progress').hide();
        });
    }
}

//window.updateCameraMode = updateCameraMode;
window.runCode = runCode;

export{MAXSENSORS};
