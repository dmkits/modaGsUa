# for buid android project
export ANDROID_HOME=/home/dmkits/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools

# cordova build
# OR
# cordova build android --release -- --gradleArg=-PcdvMinSdkVersion=19
cordova build

# AndroidStudio
# for run android studio AVD and  run Android Emulator
sudo chmod a=rw /dev/kvm
# run AndroidStudio
/home/dmkits/android-studio/bin/studio.sh

# OR if run background use:
nohup /home/dmkits/android-studio/bin/studio.sh > /dev/null 2>&1 &

# AndroidStudio > Tools > AVD Manager
# and start Your Virtual Device (Nexus 5X API 29 x86)

cordova emulate android
