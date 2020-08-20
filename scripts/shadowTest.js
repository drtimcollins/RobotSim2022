const MOVE_UP = 1;
const MOVE_DOWN = 0;

// Scene properties
var scene_color = 0x000000;
var scene_color_alpha = 1;

// Camera Properties
var camera_angle = 0;
var camera_range = -12;
var camera_speed = 0.05 * Math.PI/180;
var camera_target = new THREE.Vector3(0, 0, -5);
var camera_focal = 70;
var camera_near = 0.1;
var camera_far = 50;

// Lights
var light_am_color = 0xAAAAAA;
var light_spot_color = 0xDDDDDD;
var light_spot_intensity = 0.7;
var light_spot_position = {x: 5, y: 5, z: 20,}
var light_spot_camera_near = 0.5;
var light_spot_shadow_darkness = 0.35;

// Sphere properties
var sphere_upper = 0;
var sphere_lower = -4.0;
var sphere_direction = MOVE_DOWN;
var sphere_move = 0.02;
var sphere_rotation_speed = 0.05;
var sphere_size = 1;
var sphere_width_seg = 12;
var sphere_height_seg = 8;
var sphere_color = 0xff0000;
var sphere_position = {x: 1, y: 1, z: 0};

// Plane Properties
var plane_width = 10;
var plane_height = 10;
var plane_width_segs = 1;
var plane_height_segs = 1;
var plane_color = 0xDDDDDD;
var plane_position = {x: 0, y: 0, z: -5};

// Box properties
var box_width = 0.5;
var box_height = 0.5;
var box_depth = 1;
var box_rotation_speed = 0.01;
var box_color = 0x005500;
var box_position = {x: -1, y: -1, z: -4};


// New renderer
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(scene_color, scene_color_alpha);

// Add the renderer to the DOM
//document.body.appendChild(renderer.domElement);
$("#renderWin").append(renderer.domElement);  

// Create the scene
var scene = new THREE.Scene();

// Set some camera defaults

var camera = new THREE.PerspectiveCamera(camera_focal, window.innerWidth/window.innerHeight, camera_near, camera_far);
camera.position.set(0, camera_range, 0);
camera.useQuaternion = true;
camera.lookAt(camera_target);

// Add abbient light
var am_light = new THREE.AmbientLight(light_am_color); // soft white light
scene.add(am_light);

// Add directional light
var spot_light = new THREE.SpotLight(light_spot_color, light_spot_intensity);
spot_light.position.set(light_spot_position.x, light_spot_position.y, light_spot_position.z);
spot_light.target = scene;
spot_light.castShadow = true;
spot_light.receiveShadow = true;
spot_light.shadowDarkness = light_spot_shadow_darkness;
spot_light.shadowCameraNear	= light_spot_camera_near;		
scene.add(spot_light);


// Add the ground plane
var plane_geometry = new THREE.PlaneGeometry(plane_width, plane_height, plane_width_segs, plane_height_segs);
var plane_material = new THREE.MeshLambertMaterial({color: plane_color});
var plane_mesh = new THREE.Mesh(plane_geometry, plane_material);
plane_mesh.position.set(plane_position.x, plane_position.y, plane_position.z);
plane_mesh.receiveShadow = true;
scene.add(plane_mesh);


// Add the box
var box_geometry = new THREE.BoxGeometry(box_width, box_height, box_depth);
var box_material = new THREE.MeshLambertMaterial({color: box_color});
var box_mesh = new THREE.Mesh(box_geometry, box_material);
box_mesh.castShadow = true;
box_mesh.receiveShadow = true;
box_mesh.position.set(box_position.x, box_position.y, box_position.z);
scene.add(box_mesh);


// Add the sphere
var sphere_geometry = new THREE.SphereGeometry(sphere_size, sphere_width_seg, sphere_height_seg);
var sphere_material = new THREE.MeshPhongMaterial({color: sphere_color});
var sphere_mesh = new THREE.Mesh(sphere_geometry, sphere_material);
sphere_mesh.castShadow = true;
sphere_mesh.receiveShadow = true;
sphere_mesh.position.set(sphere_position.x, sphere_position.y, sphere_position.z);
scene.add(sphere_mesh);

// Render loop
var render = function () {
  
  camera_angle += camera_speed;
  camera.position.x = Math.cos(camera_angle) * camera_range;
  camera.position.y = Math.sin(camera_angle) * camera_range;
  camera.up.set(0, 0, 1);
  camera.lookAt(camera_target);
  
  requestAnimationFrame(render);
  
  // Bounce the sphere
  if (sphere_direction == 1) {
    if (sphere_mesh.position.z >= sphere_upper) {
      sphere_direction = MOVE_DOWN;
      sphere_mesh.position.z -= sphere_move;
    }
    else {
      sphere_mesh.position.z += sphere_move;
    }
  } 
  else {
    if (sphere_mesh.position.z <= sphere_lower) {
      sphere_direction = MOVE_UP;
      sphere_mesh.position.z += sphere_move;
    }
    else {
      sphere_mesh.position.z -= sphere_move;
    }
  }
  
  // Rotate the sphere
  sphere_mesh.rotation.z += sphere_rotation_speed;
  
  // Rotate the box
  box_mesh.rotation.x += box_rotation_speed;
  box_mesh.rotation.y += box_rotation_speed;
  
  renderer.render(scene, camera);
};

render();
