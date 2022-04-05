import { Fetcher } from "./Fetcher.mjs";
import { ImageExtractor } from "./ImageExtractor.mjs";

const main = async function() {
  const html = await Fetcher.fetchHtml();
  const images = ImageExtractor.getImages(html);
}

main();
