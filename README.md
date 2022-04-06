# FairPhone 4 Automatic Root Updater (Research)

This does not actually work. Using Magisk to patch an image on a workstation does currently not produce images identical to on-device patching.

Furthermore, _updating_ a phone through this mechanism is likely not a viable option in the first place.

## Quick Start

1. Download the [Magisk APK](https://github.com/topjohnwu/Magisk/releases) and extract the contents into `./magisk`.

1. Build and run the updater.

    ```shell
    yarn invoke
    ```

## WSL

1. Make sure `dos2unix` is installed.

    ```shell
    sudo apt install dos2unix
    ```

1. Make sure `adb` is available. If you have Android Studio installed on Windows, you can link that `adb` into some folder you have on you `PATH`. For example:

    ```shell
    ln -s /mnt/c/Program\ Files\ \(x86\)/Android/android-sdk/platform-tools/adb.exe ~/bin/adb
    ```
