// RobotDraw using three.js

var container, camera, scene, renderer;
var trackMesh;
var trackWidth = 1180, trackHeight = 834;

// Start-up initialisation
$(function(){

    scene = new THREE.Scene();
    scene.add( new THREE.AmbientLight(0xFFFFFF));

    addTrack(scene, {w:trackWidth, h:trackHeight, path:'img/Test Track 2018.png'});

    camera = new THREE.PerspectiveCamera(60, trackWidth/trackHeight, 1, 2000);
//    camera.position.set(trackWidth/2, trackHeight/2, trackHeight/2/Math.tan(30.0*Math.PI/180.0)); 
    camera.position.set(trackWidth/2, 0, 600); 
    camera.lookAt(new THREE.Vector3(trackWidth/2, trackHeight/2, 0));

    renderer = new THREE.WebGLRenderer();
    renderer.domElement.id = "threeDrenderer"
    $("#renderWin").append(renderer.domElement);   

    onResize();
    animate();
});

$(document).ready(function(){
    $(window).resize(function(){console.log("Resize");onResize();});
});


function animate() {
    requestAnimationFrame( animate );

    if(trackMesh != null){
//    trackMesh.rotation.x += 0.005;
//    mesh.rotation.y += 0.01;
    }
    renderer.render( scene, camera );
}

function onResize(){
    $("#renderWin").height($("#renderWin").width()*trackHeight/trackWidth);
    renderer.setSize($("#renderWin").width(), $("#renderWin").height());
}

function addTrack(myscene, trackInfo){
    var textureLoader = new THREE.TextureLoader();    
    var g = new THREE.Geometry();
    g.vertices.push(new THREE.Vector3(0,0,0));
    g.vertices.push(new THREE.Vector3(0,trackInfo.h,0));
    g.vertices.push(new THREE.Vector3(trackInfo.w,trackInfo.h,0));
    g.vertices.push(new THREE.Vector3(trackInfo.w,0,0));
    g.faces.push(new THREE.Face3(0,3,2));
    g.faces.push(new THREE.Face3(2,1,0));
    g.faceVertexUvs[0].push([new THREE.Vector2(0,0), new THREE.Vector2(1,0), new THREE.Vector2(1,1)]);    
    g.faceVertexUvs[0].push([new THREE.Vector2(1,1), new THREE.Vector2(0,1), new THREE.Vector2(0,0)]);    
    var material = new THREE.MeshBasicMaterial({color : 0xfffffff});
    textureLoader.load(trackInfo.path, function(texture) {
        // OnLoad function
       material.map = texture;
       trackMesh = new THREE.Mesh(g, material);
       myscene.add(trackMesh);

    }, undefined, function(){
        alert('Map load error');
    });
}