MediRisk – Multi-Platform Mobile Application

1. Introduction
	
	For the multi-platform mobile application, there are three variations available.
	
	a. app_bootstrap – This is the initial implementation of the MediRisk mobile application, which uses Bootstrap as the CSS framework and Angular as the MVC framework. This version needs access to the server and does not have local storage.
	b. app_ionic – This is the second iteration of the MediRisk mobile application, which uses Ionic instead of Bootstrap and Angular as the MVC framework. It has local storage for caching medical models but there is a minor bug that causes it to fail. This bug will be fixed in the future.
	c. app_ionic-noserver – This is the third iteration of the MediRisk mobile application, which uses Ionic instead of Bootstrap and Angular as the MVC framework. Medical models are stored locally within the app, and the server features are dormant. 

2. Dependencies

All the three iterations mentioned above use Cordova to build for multiple platforms. 

Dependencies needed before building the mobile application:

	a. Android SDK (for apk)
	b. iOS Development Tools (for ipa)
	c. npm – Node Package Manager
	d. Node.js – Runtime Environment
	e. Ant
	f. Install Cordova: npm install –g cordova
	g. Install Ionic: npm install –g ionic
	h. Update Cordova: npm update cordova
	i. Update Ionic: npm update ionic

Note: Update Cordova in order to keep it compatible with latest iOS Development Tools and Android SDK. Otherwise, build errors will be encountered.

3. Building Source Code

Building for Android (same for all three iterations):

	a. cd app_ionic_noserver
	b. cordova plugin add org.apache.cordova.file
	c. cordova plugin add org.apache.cordova.file-transfer
	d. cordova platform add android
	e. cordova build android
	f. The build directory for the specific platform is available under “app_ionic_noserver/platforms”.

Note: In order to build for iOS replace “android” with “ios” in the above commands. Make sure $PATH is properly setup with Android and iOS development tools. 

4. Troubleshooting Unknown Errors

If unknown errors occur, then create a new project and then build again. This resolves the build error that was seen for Android.

Create a new project, copy MediRisk source code and rebuild:

	a. Syntax - cordova create directory_name package_name app_name
	Example - cordova create app_noserver com.phonegap.medirisk MediRisk
	b. The main source code lies in “$newproject_root/www/*”. In the new project, remove the default source provided.
	c. Copy the source from one of the three iterations. app_ionic_noserver iteration has the source code in “app_ionic_noserver/www/*”. 
	d. Repeat the steps for building source provided in Section 3.

Commands:

	a. cordova create app_noserver1 com.phonegap.medirisk MediRisk
	b. rm –rf app_noserver1/www/*
	c. cp –r app_ionic-noserver/www/* app_noserver1/www/.
	d. cd app_noserver1
	e. Repeat steps b – e in Section 3.

Note - Server instructions will be provided later.
