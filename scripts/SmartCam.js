// SmartCam - handles track and lighting
class SmartCam extends THREE.PerspectiveCamera{
    constructor(scene){
        const initFov = 30;
        super(initFov, scene.width/scene.height, 1, 5000);
        this.fov = initFov;        
        this.trackWidth = scene.width;
        this.trackHeight = scene.height;

        this.camTarget = new THREE.Mesh( new THREE.CubeGeometry(1,1,0.1));
        this.camTarget.position.set(this.trackWidth/2, this.trackHeight/2,1);
        scene.add(this.camTarget);    

        this.phi = 50;
        this.phiTarget = 50;
        this.setCamPos(this.phi);
    }

    setCamPos(){
        const phi = this.phi;
        const zc   = this.trackHeight/2 * (1/Math.tan(this.fov*Math.PI/360.0) + Math.sin(phi*Math.PI/180));
        const zcam = -zc * Math.cos(phi*Math.PI/180);
        const ycam = zc * Math.sin(phi*Math.PI/180);
    
        this.position.set(this.trackWidth/2, this.trackHeight/2 + ycam, zcam); 
        this.lookAt( this.camTarget.position );
        this.rotateZ(Math.PI);        
    }

    update(){
        if(this.phi != this.phiTarget){
            const dPhi = this.phiTarget - this.phi;
            this.phi += Math.sign(dPhi)*2;
            if(Math.abs(this.phi - this.phiTarget) < 1) this.phi = this.phiTarget;
            this.setCamPos();
        }
    }
}

export { SmartCam };         