const guiAR = 4.0;

class RobotGui{
    constructor(){
        this.two = new Two({width:500,height:500/guiAR,type:Two.Types.canvas}).appendTo(document.getElementById('guiWin'));
    
        var circle = this.two.makeCircle(20, 20, 13);    
        circle.fill = '#00AAAA';
        circle.stroke = 'orangered'; // Accepts all valid css color
        circle.linewidth = 1;
        var text = new Two.Text("0123456789 message", 250, 7);
        this.two.add(text);        
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

export { RobotGui }; 