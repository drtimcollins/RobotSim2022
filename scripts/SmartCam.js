// SmartCam - handles track and lighting
const TPrange = 200;
class SmartCam extends THREE.PerspectiveCamera{
    constructor(scene, robot){
        const initFov = 30;
        super(initFov, scene.width/scene.height, 1, 5000);
        //this.fov = initFov;        
        this.trackWidth = scene.width;
        this.trackHeight = scene.height;
        this.robot = robot;

        this.camTarget = new THREE.Mesh( new THREE.CubeGeometry(1,1,0.1));
        this.camTarget.position.set(this.trackWidth/2, this.trackHeight/2,1);
        scene.add(this.camTarget);    

        //this.testShape = new THREE.Mesh( new THREE.CubeGeometry(10,10,10));        
        //scene.add(this.testShape);

        this.phi = 50;
        this.phiTarget = 50;
        this.follow = 0;
        this.followTarget = 0;
        this.onBoard = 0;
        this.onBoardTarget = 0;
        this.TPcamPos = this.robot.shape.position.clone(); this.TPcamPos.x -= TPrange; this.TPcamPos.z -= 100;
//        this.TPcamPos = new THREE.Vector3(-TPrange, 0, -150);
        this.setCamPos(this.phi);
    }

    setCamPos(){
        const phi = this.phi;
        const zc   = this.trackHeight/2 * (1/Math.tan(this.fov*Math.PI/360.0) + Math.sin(phi*Math.PI/180));
        const zcam = -zc * Math.cos(phi*Math.PI/180);
        const ycam = zc * Math.sin(phi*Math.PI/180);
    
        const following = Math.max(this.follow, this.onBoard);
        
        this.camTarget.position.set(this.trackWidth/2*(1-following) + this.robot.shape.position.x*following, this.trackHeight/2*(1-following) + this.robot.shape.position.y*following, 1);
        
        const pos1 = this.TPcamPos.clone();
        const pos2 = new THREE.Vector3(this.camTarget.position.x, this.camTarget.position.y + ycam*(1-0.5*this.follow), zcam*(1-0.5*this.follow)); 
        this.position.copy(pos1.multiplyScalar(this.onBoard).add(pos2.multiplyScalar(1-this.onBoard)));
        this.up.set(0,-Math.cos(this.onBoard*Math.PI/2),-Math.sin(this.onBoard*Math.PI/2));
        this.lookAt( this.camTarget.position );
    }
    
    update(){
        if(this.phi != this.phiTarget){
            const dPhi = this.phiTarget - this.phi;
            this.phi += Math.sign(dPhi)*2;
            if(Math.abs(this.phi - this.phiTarget) < 1) this.phi = this.phiTarget;
            this.setCamPos();
        }
        if(this.follow != this.followTarget){
            const dF = this.followTarget - this.follow;
            this.follow += Math.sign(dF)*0.05;
            if(Math.abs(this.follow-this.followTarget) < 0.05) this.follow = this.followTarget;                        
            this.setCamPos();
        }
        if(this.onBoard != this.onBoardTarget){
            const dF = this.onBoardTarget - this.onBoard;
            this.onBoard += Math.sign(dF)*0.05;
            if(Math.abs(this.onBoard-this.onBoardTarget) < 0.05) this.onBoard = this.onBoardTarget;                        
            this.fov = 30 + this.onBoard*20;
            this.updateProjectionMatrix();
            this.setCamPos();
        }
        
        const rVec = this.TPcamPos.clone().sub(this.robot.shape.position);
        rVec.z = 0;
        rVec.normalize().multiplyScalar(TPrange).add(this.robot.shape.position);
        rVec.z = -150;
        this.TPcamPos.copy(rVec);
        //this.testShape.position.copy(this.TPcamPos);
        
        

        if(this.follow > 0 || this.onBoard > 0) this.setCamPos();
    }
}

export { SmartCam };         