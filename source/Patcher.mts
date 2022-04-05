import fs from "fs/promises";
import path from "path";

export class Patcher {
  static PATH_BOOT_PATCH = "assets/boot_patch.sh";
  static PATH_UTIL_FUNCTIONS = "assets/util_functions.sh";
  static PATH_MAGISKBOOT = "lib/x86_64/libmagiskboot.so";
  static PATH_MAGISK32 = "lib/armeabi-v7a/libmagisk32.so";
  static PATH_MAGISK64 = "lib/arm64-v8a/libmagisk64.so";
  static PATH_MAGISKINIT = "lib/arm64-v8a/libmagiskinit.so";

  static get magiskPath() {
    return path.resolve("magisk");
  }
  static get magiskPathPatched() {
    return path.resolve("magisk-patched");
  }

  static async canPatch() {
    try {
      await fs.stat(path.resolve(Patcher.magiskPath, Patcher.PATH_MAGISKBOOT));
      return true;
    } catch (error) {
      console.debug(`!! Extract the contents of the magisk APK into '${Patcher.magiskPath}'!`);
      return false;
    }
  }

  static async isMagiskPatched() {
    try {
      const utilFunctions = await fs.readFile(
        path.resolve(Patcher.magiskPathPatched, Patcher.PATH_UTIL_FUNCTIONS),
        "utf-8"
      );
      const hasOriginal = utilFunctions.match(/^ui_print__original\(\) \{$/m);
      return hasOriginal !== null;
    } catch (error) {
      return false;
    }
  }

  static async patchMagisk() {
    if (!Patcher.canPatch()) {
      throw new Error("Unable to patch images. Magisk binaries could not be found.");
    }

    if (await Patcher.isMagiskPatched()) {
      console.info(" ! Magisk is already patched. Good.");
      return;
    }

    console.warn(` ! Patching Magisk in '${Patcher.magiskPath}'...`);

    // Create output path. Why are NodeJS FS APIs so goddamn useless?
    try {
      await fs.mkdir(Patcher.magiskPathPatched);
    } catch (error: unknown) {
      if ((error as { code: string }).code !== "EEXIST") {
        throw error;
      }
    }

    await fs.copyFile(
      path.resolve(Patcher.magiskPath, Patcher.PATH_MAGISKBOOT),
      path.resolve(Patcher.magiskPathPatched, "magiskboot")
    );
    await fs.copyFile(
      path.resolve(Patcher.magiskPath, Patcher.PATH_MAGISK32),
      path.resolve(Patcher.magiskPathPatched, "magisk32")
    );
    await fs.copyFile(
      path.resolve(Patcher.magiskPath, Patcher.PATH_MAGISK64),
      path.resolve(Patcher.magiskPathPatched, "magisk64")
    );
    await fs.copyFile(
      path.resolve(Patcher.magiskPath, Patcher.PATH_MAGISKINIT),
      path.resolve(Patcher.magiskPathPatched, "magiskinit")
    );

    await fs.copyFile(
      path.resolve(Patcher.magiskPath, Patcher.PATH_BOOT_PATCH),
      path.resolve(Patcher.magiskPathPatched, "boot_patch.sh")
    );

    const utilFunctions = await fs.readFile(
      path.resolve(Patcher.magiskPath, Patcher.PATH_UTIL_FUNCTIONS),
      "utf-8"
    );
    const patchedUtils = utilFunctions
      .replace(
        /^ui_print\(\) \{$/m,
        `ui_print() {
  echo $1
}

ui_print__original() {`
      )
      .replace(/getprop/g, "adb getprop");
    await fs.writeFile(path.resolve(Patcher.magiskPathPatched, "util_functions.sh"), patchedUtils);

    console.warn(` ! Magisk successfully patched into '${Patcher.magiskPathPatched}'.`);
  }

  static async patch(targetFile: string) {
    await Patcher.patchMagisk();
    console.info(
      `-> sh "${path.resolve(Patcher.magiskPathPatched, "boot_patch.sh")}" "${targetFile}"`
    );

    return;
  }
}
