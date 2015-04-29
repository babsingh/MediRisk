.PHONY: all test clean

all: ios android

add:
	cordova platform add ios

test:
	open platforms/ios/*.xcodeproj

ios:
	cordova build ios

android:
	cordova build android

clean:
	rm -rf platforms
