const guiAR = 6.0;
const skewFactor = 10.0;
const onCol = '#001020';
const offCol = '#E0E0FF';
const segDec = [[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1],[0,1,1,0,0,1,1],[1,0,1,1,0,1,1]
                ,[1,0,1,1,1,1,1],[1,1,1,0,0,0,0],[1,1,1,1,1,1,1],[1,1,1,1,0,1,1]];
class RobotGui{
    constructor(callback){
        this.two = new Two({width:500,height:500/guiAR}).appendTo(document.getElementById('guiWin'));  
        this.camMode = 0;
        this.camZoom = 0;
        this.b = new Array(5);
        for(let i = 0; i < 5; i++){
            this.b[i] = new Icon(280+i*30,20,25,i,this.two);            
        }
        this.bDes = new Icon(487,20,25,5,this.two);
        this.refillIcons();
        //this.text = new Two.Text("0123456789 message", 250, 7);
        //this.two.add(this.text); 
        this.two.add(new Two.Text("This lap", 60, 40, {size:10}));
        this.two.add(new Two.Text("Last lap", 180, 40, {size:10}));
        this.two.add(new Two.Text("Camera options", 360, 40, {size:10}));
        this.timers = [new Digits(60,20,8, this.two), new Digits(180,20,8, this.two)];
        this.two.update();
        for(var i = 0; i < 5; i++){
            this.b[i]._renderer.elem.addEventListener('click', function(){callback(this.id);}, false);
        }
        this.bDes._renderer.elem.addEventListener('click', function(){callback(this.id);}, false);
        
        this.two.play();       
    }

    refillIcons(){
        for(let i = 0; i < 5; i++){
            this.b[i].bg.fill = '#FAFAFF';
        }
        this.b[this.camMode].bg.fill = '#FFFFAA';
        this.b[this.camZoom + 3].bg.fill = '#FFFFAA';
    }
    
    resize(newWidth){
        if(this.two != null){
            this.two.height = newWidth/guiAR;
            this.two.width = newWidth;
            this.two.scene.scale = newWidth/500;
            this.two.update();
        }    
    }
}
class Icon extends Two.Group{
    constructor(x, y, h, i, two){
        super();       
        this.bg = two.makeRoundedRectangle(0, 0, h, h, h/5);
        this.add(this.bg);
        switch(i){
            case 0: // Top view
                this.add(two.makeRectangle(-0.25*h,0.3*h,0.2*h,0.02*h));
                this.add(two.makeRectangle(-0.25*h,-0.3*h,0.2*h,0.02*h));
                this.add(two.makePath(-0.35*h,0.25*h,-0.15*h,0.25*h,0.33*h,0,-0.15*h,-0.25*h,-0.35*h,-0.25*h,false));
                this.add(two.makeRectangle(0.33*h,0,0.06*h,0.25*h));
                break;
            case 1: // Side view
                this.add(two.makePath(-0.35*h,0,-0.35*h,-0.2*h,-0.15*h,-0.2*h,0.33*h,0,false));
                this.add(two.makeCircle(-0.25*h,0,0.1*h));
                break;
            case 2: // Back view
                this.add(two.makeRectangle(-0.3*h,0,0.02*h,0.2*h));
                this.add(two.makeRectangle(0.3*h,0,0.02*h,0.2*h));
                this.add(two.makeRectangle(0,-0.07*h,0.5*h,0.2*h));
                break;
            case 3: // Zoom out
            case 4: // Zoom in
                let m = [two.makeLine(-0.1*h,-0.1*h,0.3*h,0.3*h), two.makeCircle(-0.1*h,-0.1*h,0.25*h),
                    two.makeLine(-0.25*h,-0.1*h,0.05*h,-0.1*h), two.makeLine(-0.1*h,-0.25*h,-0.1*h,0.05*h)];
                for(let n = 0; n < i; n++){
                    m[n].linewidth = h*.1;
                    this.add(m[n]);
                }
                break;
            case 5:
                let b = two.makeArcSegment(-0.2*h, -0.2*h, 0.1*h, 0.2*h, -Math.PI/4, Math.PI*3/4);
                let b1 = two.makeLine(-0.11*h,-0.11*h,0.3*h,0.3*h);
                b.fill = '#000000';
                this.add(b);
                b1.linewidth = h*.1;
                this.add(b1);
                break;
        }
        this.translation.x = x;
        this.translation.y = y;     
        this.id = "Icon"+i.toString();   
        two.add(this);
    }
}
class Digits extends Two.Group{
    constructor(x, y, h, two){
        super();
        this.digits = [new Digit(-h*4.9, 0, h, two), new Digit(-h*3.1, 0, h, two),
                       new Digit(-h*.9, 0, h, two), new Digit(h*.9, 0, h, two), 
                       new Digit(h*3.1, 0, h, two), new Digit(h*4.9, 0, h, two),
                       new Digit(h*2, 0, h, two, true), new Digit(-h*2, 0, h, two, true)];
        this.digits.forEach(el =>{this.add(el);});
        this.translation.x = x;
        this.translation.y = y;
        two.add(this);
        for(var n = 0; n < 6; n++){
            this.digits[n].setNum(0);
        }
    }
    setTime(ms){
        var z = Math.floor(ms/10);
        for(var n = 0; n < 6; n++){
            let d = (n==3) ? 6 : 10;
            let z1 = Math.floor(z/d);
            this.digits[5-n].setNum(z - z1*d);
            z = z1;
        }
    }
}
class Digit extends Two.Group{
    constructor(x, y, h, two, isSep=false){
        super();
        if(isSep){
            this.segs = [two.makeCircle(-0.4 / skewFactor, 0.4, 0.15), two.makeCircle(0.4 / skewFactor, -0.4, 0.15)];
            this.segs.forEach(el => {
                this.add(el);            
                this.fill = onCol;         
            });  
        } else {
        this.segs = [two.makePath(-0.6,-0.9, -0.5,-1, 0.5,-1, 0.6,-0.9, 0.5,-0.8, -0.5,-0.8, true),
            two.makePath(0.6,-0.9, 0.7,-0.8, 0.7,0, 0.6,0, 0.5,-0.1, 0.5,-0.8, true),
            two.makePath(0.6,0.9, 0.7,0.8, 0.7,0, 0.6,0, 0.5,0.1, 0.5,0.8, true),
            two.makePath(-0.6,0.9, -0.5,1, 0.5,1, 0.6,0.9, 0.5,0.8, -0.5,0.8, true),
            two.makePath(-0.6,0.9, -0.7,0.8, -0.7,0, -0.6,0, -0.5,0.1, -0.5,0.8, true),
            two.makePath(-0.6,-0.9, -0.7,-0.8, -0.7,0, -0.6,0, -0.5,-0.1, -0.5,-0.8, true),
            two.makePath(-0.6,0, -0.5,.1, 0.5,.1, 0.6,0, 0.5,-0.1, -0.5,-0.1, true)];
            this.segs.forEach(el => {
                this.skew(el);
                this.add(el);   
//                this.fill = '#AA00AA';         
            });  
        }

        this.translation.x = x;
        this.translation.y = y;
        this.scale = h;
        
        this.noStroke();
        two.add(this);
    }
    skew(el){
        el._collection.forEach(element => {
            element.x *= 0.9;
            element.y *= 0.9;
            element.x -= (element.y + el._translation.y) / skewFactor;    
        });
    }
    setNum(z){
        for(var n = 0; n < 7; n++){
            this.segs[n].fill = (segDec[z][n]==1) ? onCol : offCol;
        }
    }
}

export { RobotGui }; 