import fs from "fs/promises";
import zlib from "zlib";
import { Fetcher } from "./Fetcher.mjs";
import { ImageExtractor } from "./ImageExtractor.mjs";
import { Patcher } from "./Patcher.mjs";

const main = async function () {
  const html = await Fetcher.fetchHtml(
    "https://code.fairphone.com/projects/fairphone-4-kernel.html"
  );
  const images = ImageExtractor.getImages(html);
  const builds = images.sort((a, b) => a.buildNumber - b.buildNumber);

  console.info("Available builds:");
  for (const build of builds) {
    console.info(` - ${build.buildCode}: ${build.href}`);
  }

  if (builds.length < 1) {
    console.error("No builds found. This is unexpected. Maybe the website changed?");
    process.exit(1);
  }

  const latestBuild = builds[builds.length - 1];
  console.info(`Downloading ${latestBuild.href}...`);
  const image = await Fetcher.fetchBuffer(latestBuild.href);

  let imageBuffer = image;
  if (latestBuild.gzipped) {
    console.info(" ! Image is gzipped and requires decompression.");
    const decompressed = zlib.gunzipSync(image);
    console.info(` ? Image was uncompressed to ${decompressed.length} bytes.`);
    imageBuffer = decompressed;
  }

  console.info("Writing image file...");
  const imageFilename = `boot-${latestBuild.buildCode}.img`;
  await fs.writeFile(imageFilename, imageBuffer, "binary");
  console.info(` = Image file written as '${imageFilename}'`);

  if (await Patcher.canPatch()) {
    console.info("Patching image...");
    const patchCli = await Patcher.patch(imageFilename);

    const imageFilenamePatched = `boot-${latestBuild.buildCode}-patched.img`;
    await Patcher.copyNewBootImg(imageFilenamePatched);
    console.info(` = Patched image: ${imageFilenamePatched}`);
    console.info(` ? To run this patch again : ${patchCli}`);
    console.info(` ? To deploy to device     : adb push ${imageFilenamePatched} /storage/emulated/0/`);
    
  } else {
    console.warn("Unable to patch on-site. Patch image on Android device instead.");
    console.info("");
    console.info(" --- Next steps --- ");
    console.info("");
    console.info(`$ adb push boot-${latestBuild.buildCode}.img /storage/emulated/0/`);
    console.info("$ adb pull /storage/emulated/0/Download/magisk_patched-X_Y.img");
    console.info("");
  }

  console.info("Done.");
};

main();
