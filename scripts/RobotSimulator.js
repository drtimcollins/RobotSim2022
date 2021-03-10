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
//const sceneParams = {width:1280, height:720, sf:{x:640,y:597}, name:'basicTrack'};
//const sceneParams = {width:1280, height:720, sf:{x:640,y:663}, name:'hairPinTrack'};
//const sceneParams = {width:1280, height:720, sf:{x:640,y:663}, name:'twistyTrack'};
const sceneParams = {width:1280, height:720, sf:{x:640,y:645}, name:'uTrack'};

var robotParams = {
    width: 90,
    length: 120,
    NumberOfSensors: 2,
    SensorSpacing: 15};
var robot, rec, laps, editor;
var lastTime, bestTime, isRaceOver;
//var sliderLength, sliderWidth, sliderSpacing, sliderNumSensors;
//var sliderLengthPR;

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
    clk = new THREE.Clock(false);
    gui = new RobotGui(onIconClicked);
    cpp = new RobotCompiler();
    $('.runButton').prop('disabled', true);
    $('#guiWin').hide();

    $('#botColour').bind('input',function(){
        console.log("Colour selected.");
        robot.shape.setBodyColour($('#botColour').val());
    });
    $('#wheelColour').bind('input',function(){
        console.log("Colour selected.");
        robot.shape.setWheelColour($('#wheelColour').val());
    });
    $('input[type=radio][name=LEDcolor]').change(function() {
        robot.shape.setLEDColour(this.value);
        console.log(this.value);
    });
    $("#selectFiles").change(function(e) {
        uploadDesign(e);
    });
    $("#selectFiles").bind('input',function(e) {
       console.log("IINPUTT");
    });
    //	 $("#progress").show();

    onResize();
    update(0);
});

$(document).ready(function(){
    $(window).resize(function(){console.log("Resize");onResize();});
});

function onSliderChanged(){
    robotParams.length = parseFloat($('#sliderLength').val());
    robotParams.width = parseFloat($('#sliderWidth').val());
    robotParams.SensorSpacing = parseFloat($('#sliderSpacing').val());
    robotParams.NumberOfSensors = parseFloat($('#sliderNumSensors').val());    
    robot.shape.setSize(robotParams);
}

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
        robot.shape.refreshLEDs();
        update(0);        
    }

    gui.refillIcons();
}

function onTrackLoaded(){
    console.log("Track Loaded");
    cpp.init({track: scene.trackLine.geometry.vertices,
              start: sceneParams.sf,
              robot: robotParams});
    $('.runButton').prop('disabled', false);
}

function update() {
    // Set visibility
    scene.trackMesh.visible = (dmode == dispMode.RACE);
    scene.gridHelper.visible = scene.turntableTop.visible = scene.turntable.visible = !(dmode == dispMode.RACE);
    scene.background = scene.bgList[(dmode == dispMode.RACE)?1:0];


    if(dmode == dispMode.RACE){
        if(clk.getElapsedTime() <= 61.0){
            let frameCount = clk.getElapsedTime() * 50.0 - 50.0; // 1 second start 'countdown'
            let lapTime = 0;
            let lapStart = 0;
            laps.forEach(lapn=>{ if(frameCount > lapn){
                lapTime = lapn - lapStart;
                lapStart = lapn;
                bestTime = Math.min(lapTime, bestTime);
            }}); 
            gui.timers[1].setTime(lapTime * 20.0);   
            gui.timers[0].setTime(Math.max((frameCount-lapStart) * 20.0, 0));   
            if(frameCount - lapStart < lastTime)
                $('#coutBox').text($('#coutBox').text() + '\n' + 'Lap Time: ' + getTimeString(lapTime * 20.0));
            lastTime = frameCount - lapStart;
        } else {
            gui.timers[0].setTime(0);
            if(!isRaceOver){
                isRaceOver = true;
                if(bestTime < 100000)
                    $('#coutBox').text($('#coutBox').text() + '\n' + 'Simulation over. Best lap: ' + getTimeString(bestTime * 20.0));
                else
                    $('#coutBox').text($('#coutBox').text() + '\n' + 'Simulation over. No complete laps recorded.');
            }
        }
    }

        

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

function getTimeString(ms){
    let ts = "";
    var digits = new Array(6);
    let z = Math.floor(ms/10);
    for(var n = 0; n < 6; n++){
        let d = (n==3) ? 6 : 10;
        let z1 = Math.floor(z/d);
        //digits[5-n].setNum(z - z1*d);
        ts = ((n==1 || n == 3)?':':'') + (z - z1*d) + ts;
        z = z1;
    }
    return ts;
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
     console.log("Height: " + $(document).get(0).body.scrollHeight);
     parent.postMessage($(document).get(0).body.scrollHeight, "*");
}

function runCode(trackIndex){
    if(robot.shape.radius > 125){
        $('#coutBox').text("Fail\nRobot is too big. Maximum diameter = 250mm, robot diameter = "+(robot.shape.radius*2.0).toFixed(1)+"mm\n"); 
    } else {
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
                    lastTime = -100;
                    bestTime = 100000;
                    isRaceOver = false;
                    clk.stop();
                    clk.elapsedTime = 0;
                    //console.log(clk.getElapsedTime());
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
}

function downloadDesign(){
    console.log("Downloading");

    var robotParameters = {
        width: robotParams.width,
        length: robotParams.length,
        NumberOfSensors: robotParams.NumberOfSensors,
        SensorSpacing: robotParams.SensorSpacing,
        BodyColour: robot.shape.body1.material.color.getHexString(),
        WheelColour: robot.shape.Rw.material.color.getHexString(),
        LEDColour: robot.shape.LEDColour,
        Code: editor.getValue()
    };

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(robotParameters)));
    element.setAttribute('download', "robotData.json");
    
    element.style.display = 'none';
    document.body.appendChild(element);    
    element.click();
    document.body.removeChild(element);
}

function uploadDesign(event){
    console.log("Uploading");
    var reader = new FileReader();
    reader.onload = function(event){
        var o = JSON.parse(event.target.result);
        $('#sliderLength').val(o.length);
        $('#inputLength').val(o.length);
        $('#sliderWidth').val(o.width);
        $('#inputWidth').val(o.width);
        $('#sliderSpacing').val(o.SensorSpacing);
        $('#inputSpacing').val(o.SensorSpacing);
        $('#sliderNumSensors').val(o.NumberOfSensors);
        $('#inputNumSensors').val(o.NumberOfSensors);
        robotParams.width = o.width;
        robotParams.length = o.length;
        robotParams.NumberOfSensors = o.NumberOfSensors;
        robotParams.SensorSpacing = o.SensorSpacing;
        robot.shape.setSize(robotParams);
        robot.shape.setBodyColour('#'+o.BodyColour);
        robot.shape.setWheelColour('#'+o.WheelColour);
        $('#botColour').val('#'+o.BodyColour);
        $('#wheelColour').val('#'+o.WheelColour);
        $('input:radio[name=LEDcolor][value='+o.LEDColour+']').click();
        editor.setValue(o.Code);
        editor.clearSelection();
    }
    reader.readAsText(event.target.files[0]);
    $('#selectFiles').val("");
}

window.runCode = runCode;
window.downloadDesign = downloadDesign;
window.uploadDesign = uploadDesign;
window.onSliderChanged = onSliderChanged;
export{MAXSENSORS};
