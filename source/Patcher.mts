import fs from "fs/promises";
import path from "path";

export class Patcher {
  static PATCH_TOOL_PATH = "./magisk/lib/x86/libmagiskboot.so";
  static PATH_UTIL_FUNCTIONS = "./magisk/assets/util_functions.sh";

  static get magiskPath() {
    return path.resolve("magisk");
  }

  static async canPatch() {
    try {
      await fs.stat(Patcher.PATCH_TOOL_PATH);
      return true;
    } catch (error) {
      console.debug(`!! Extract the contents of the magisk APK into '${Patcher.magiskPath}'!`);
      return false;
    }
  }

  static async isMagiskPatched() {
    const utilFunctions = await fs.readFile(Patcher.PATH_UTIL_FUNCTIONS, "utf-8");
    const hasOriginal = utilFunctions.match(/^ui_print__original() {$/);
    return hasOriginal !== null;
  }

  static async patchMagisk() {
    if (!Patcher.canPatch()) {
      throw new Error("Unable to patch images. Magisk binaries could not be found.");
    }

    console.warn(`Patching Magisk in '${Patcher.magiskPath}'...`);

    if (await Patcher.isMagiskPatched()) {
      console.warn(" ! Already patched. Good.");
      return;
    }

    const utilFunctions = await fs.readFile(Patcher.PATH_UTIL_FUNCTIONS, "utf-8");
    const patchedUtils = utilFunctions.replace(
      /^ui_print() {$/,
      `ui_print() {
      echo $1
    }

    ui_print__original() {`
    );
    await fs.writeFile(Patcher.PATH_UTIL_FUNCTIONS, patchedUtils);
    console.warn("Magisk successfully patched.");
  }

  static async patch(targetFile:string) {
    await Patcher.patchMagisk();
    
    return;
  }
}
