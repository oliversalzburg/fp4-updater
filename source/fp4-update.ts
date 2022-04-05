import { Fetcher } from "./Fetcher";

const main = async function() {
  const html = await Fetcher.fetchHtml();
  console.log(html);
}

main();
