#include <iostream>
#include <complex>
#define DEFINES
#define black_threshold 100
using namespace std;

complex<double> bearing	(1.0, 0);
complex<double> R		(1.0, 0);
complex<double> L		(1.0, 0);
complex<double> speed	(1, 5);	// TEMP TEST BODGE
complex<double> av		(0, 0);
complex<double> xy		(XSTART, YSTART);
complex<double> vv;
complex<double> j		(0, 1);
int an[NumberOfSensors];

int main(){	
	for(int n = 0; n < 3000; n++){

		// Update!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// Control!!!!!!!!!!!!!!!!!!!!!!!

		av = av*0.95 + speed*0.05;
		vv = bearing * (real(av) + imag(av))/2.0;
		bearing *= exp(j*((real(av)-imag(av))/width));
		xy += vv;
		L *= exp(-j*(real(av)/20.0));
		R *= exp(-j*(imag(av)/20.0));

		cout.precision(1);
		cout << fixed << real(xy) << " " << imag(xy) << " ";
		cout.precision(3);
		cout << real(bearing) << " " << imag(bearing) << " " << real(L) << " " << imag(L) << " " << real(R) << " " << imag(R) << " 0 0" << endl;
	}
	return 0;	
}