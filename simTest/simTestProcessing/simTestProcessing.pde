TrackSegment[] trackData;
TreeNode[] tree;
PVector[] segCentres;

void setup(){
  size(1280,720);
  loadData("Track-2020-8-31-22-3-40.csv");
  for(int n = 0; n < trackData.length; n++)
    trackData[n].print();
  buildTree();
}

void draw(){
  background(255);
  stroke(0);
  for(int n = 0; n < trackData.length; n++){
    trackData[n].drawLine();
    trackData[n].drawSegment(trackData[(n+1)%trackData.length]);
    PVector[] v = {new PVector(trackData[n].x1,trackData[n].y1), new PVector(trackData[n].x2,trackData[n].y2), 
                      new PVector(trackData[(n+1)%trackData.length].x2,trackData[(n+1)%trackData.length].y2),
                      new PVector(trackData[(n+1)%trackData.length].x1,trackData[(n+1)%trackData.length].y1)};
    if(isInQuad(new PVector(mouseX, mouseY), v))
    fill(255,0,0); else fill(255);
    
    circle(segCentres[n].x, segCentres[n].y, 6);
  }
}

boolean isInQuad(PVector p, PVector[] v){
  int[] d = new int[4];
  for(int n = 0; n < 4; n++)
    d[n] = signFn(p, v[n], v[(n+1)%4]);
  return (d[0] == d[1]) && (d[1] == d[2]) && (d[2] == d[3]);
}

int signFn(PVector p1,PVector p2,PVector p3){
  return ((p1.x-p3.x)*(p2.y-p3.y)-(p2.x-p3.x)*(p1.y-p3.y) > 0) ? 1 : -1;
}

void buildTree(){
  tree = new TreeNode[1];
  tree[0] = new TreeNode();
  tree[0].x = width/2; tree[0].y = height/2;
  tree[0].r = sqrt(tree[0].x*tree[0].x + tree[0].y*tree[0].y);
  tree[0].i1 = tree[0].i2 = -1;
  
  segCentres = new PVector[trackData.length];
  for(int n = 0; n < trackData.length; n++)
    segCentres[n] = new PVector((trackData[n].x1+trackData[n].x2+trackData[(n+1)%trackData.length].x1+trackData[(n+1)%trackData.length].x2)/4,
      (trackData[n].y1+trackData[n].y2+trackData[(n+1)%trackData.length].y1+trackData[(n+1)%trackData.length].y2)/4); 
  
  int[] ii = new int[trackData.length];
  for(int n = 0; n < trackData.length; n++) ii[n] = n;
  addBranches(0, ii, new PVector(0,0), new PVector(width,height));
  
}

void addBranches(int parentIndex, int[] i, PVector cmin, PVector cmax){
  
}

void loadData(String filename){
  Table table = loadTable(filename);
  int N = table.getRowCount();
  trackData = new TrackSegment[N];
  for(int n = 0; n < N; n++){
    trackData[n] = new TrackSegment(table.getFloat(n, 0),table.getFloat(n, 1),
                      table.getFloat(n, 2),table.getFloat(n, 3));
  }
}

class TreeNode{
  int[] branches = {-1,-1,-1,-1};
  float x, y, r;
  int i1, i2;
}

class TrackSegment{
  float x1, y1, x2, y2;
  
  TrackSegment(float a, float b, float c, float d){
    x1 = a; y1 = b; x2 = c; y2 = d;
  }
  void print(){
    println("("+nf(x1)+", "+nf(y1)+"), ("+nf(x2)+", "+nf(y2)+")");
  }
  void drawLine(){
    line(x1,y1,x2,y2);
  }
  void drawSegment(TrackSegment z){
    line(x1,y1,z.x1,z.y1);
    line(x2,y2,z.x2,z.y2);
  }
}
