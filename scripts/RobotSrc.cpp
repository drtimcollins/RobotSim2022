#include <iostream>
#include <complex>
#define DEFINES
#define black_threshold 100
using namespace std;

complex<double> bearing	(1.0, 0);
complex<double> R		(1.0, 0);
complex<double> L		(1.0, 0);
complex<double> speed	(0, 0);
complex<double> av		(0, 0);
complex<double> xy		(XSTART, YSTART);
complex<double> vv;
complex<double> j		(0, 1);
complex<double> sensorPos[NumberOfSensors];
int an[NumberOfSensors];
complex<double> *track;
int N;
complex<double> trackBounds[2];

void readTrack(void);
namespace RobotControlCode{void RobotControl();}
int signFn(double x, double y, complex<double> p2, complex<double> p3){
	return ((x-real(p3))*(imag(p2)-imag(p3))-(real(p2)-real(p3))*(y-imag(p3)) > 0) ? 1 : -1;
}
bool isInQuad(double x, double y, int i0, int i1, int i2, int i3){
	int d0 = signFn(x, y, track[i0], track[i1]);
	int d1 = signFn(x, y, track[i1], track[i2]);
	int d2 = signFn(x, y, track[i2], track[i3]);
	int d3 = signFn(x, y, track[i3], track[i0]);
	return (d0==d1 && d1==d2 && d2==d3);
}
int getSensorOutput(double x, double y){
	if(x < real(trackBounds[0]) || y < imag(trackBounds[0]) || x > real(trackBounds[1]) || y > imag(trackBounds[1]))
		return 0;   
	else{		
		for(int n = 0; n < N/2; n++){
			if(isInQuad(x, y, n*2, n*2+1, (n*2+3)%N, (n*2+2)%N))
				return 0xFFFFFF;
		}
		return 0;
	}
}
void updateSensors(void){
	complex<double> sn;
	for(int n = 0; n < NumberOfSensors; n++) {
		sn = sensorPos[n]*bearing + xy; 
		an[n] = getSensorOutput(real(sn),imag(sn));
	}        
}	
int main(){	
	readTrack();
	for(int n = 0; n < NumberOfSensors; n++) {
		sensorPos[n] = complex<double> (length, (n - (NumberOfSensors-1.0)/2.0)*SensorSpacing);
	}	
	for(int n = 0; n < 3000; n++){
		updateSensors();
		RobotControlCode::RobotControl();
		//av = av*0.95 + speed*0.05;
		av = av*0.97 + speed*0.03;
		vv = bearing * (real(av) + imag(av))/2.0;
		bearing *= exp(j*((real(av)-imag(av))/width));
		xy += vv;
		L *= exp(-j*(real(av)/20.0));
		R *= exp(-j*(imag(av)/20.0));

		cout.precision(1);
		cout << fixed << real(xy) << " " << imag(xy) << " ";
		cout.precision(2);
		cout << real(bearing) << " " << imag(bearing) << " " << real(L) << " " << imag(L) << " " << real(R) << " " << imag(R);
		for(int m = 0; m < NumberOfSensors; m++) cout << " " << (int)(an[m] > 0);
		cout << endl;
	}
	delete[] track;
	return 0;	
}
void readTrack(void){
	double r, i;
	for(int n = 0; n < 2; n++){
		cin >> r >> i;	
		trackBounds[n] = complex<double>(r,i);
	}
	cin >> N;
	track = new complex<double>[N];
	for(int n = 0; n < N; n++){
		cin >> r >> i;	
		track[n] = complex<double>(r,i);
	}
}
void Set_PWM(int n, double sp){
	if(n == 0)
		speed = complex<double>(sp / 100.0, imag(speed));
	else
		speed = complex<double>(real(speed), sp / 100.0);
}
namespace RobotControlCode{
#define ROBOTCONTROLFUNCTION
}