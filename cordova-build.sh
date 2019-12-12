# for buid android project
export ANDROID_HOME=/home/dmkits/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools

# for run android studio AVD and  run Android Emulator
sudo chmod a=rw /dev/kvm

# cordova build
# OR
# cordova build android --release -- --gradleArg=-PcdvMinSdkVersion=19
cordova build

# AndroidStudio
# AndroidStudio > Tools > AVD Manager
# and start Your Virtual Device (Nexus 5X API 29 x86)
# OR
# /home/dmkits/android-studio/bin/studio.sh

cordova emulate android

# for release build:
keytool -genkey -v -keystore gabisMApp.keystore -alias gabisMApp -keyalg RSA -keysize 2048 -validity 10000
#password restmonkey
cordova build android --release -- --keystore="gabisMApp.keystore" --storePassword=<pass> --alias=GabisMApp --password=<keypass>
#Gabis1151 Gabis1151ks
