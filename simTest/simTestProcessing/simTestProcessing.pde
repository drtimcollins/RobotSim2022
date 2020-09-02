TrackSegment[] trackData;
TreeNode[] tree;

void setup(){
  size(1280,720);
  loadData("Track-2020-8-31-22-3-40.csv");
  for(int n = 0; n < trackData.length; n++)
    trackData[n].print();
  tree = new TreeNode[1];
  tree[0] = new TreeNode();
  tree[0].x = width/2; tree[0].y = height/2;
  tree[0].r = sqrt(tree[0].x*tree[0].x + tree[0].y*tree[0].y);
  tree[0].i1 = tree[0].i2 = -1;
}

void draw(){
  background(255);
  stroke(0);
  for(int n = 0; n < trackData.length; n++){
    trackData[n].drawLine();
    trackData[n].drawSegment(trackData[(n+1)%trackData.length]);
  }
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
