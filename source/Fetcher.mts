import https from "https";

export class Fetcher {
  static async fetchHtml(url: string): Promise<string> {
    const options = new URL(url);

    console.debug(`Requesting ${options.pathname} from ${options.host}...`);
    return new Promise((resolve, reject) => {
      https
        .get(options, response => {
          console.debug(` ? ${options.host} responded with: ${response.statusCode}`);

          const dataBuffer = new Array<string>();

          response.on("data", chunk => {
            dataBuffer.push(chunk);
            return;
          });

          response.on("end", () => {
            const html = dataBuffer.join("");
            console.debug(` = Received complete document (${html.length} bytes).`);
            resolve(html);
          });
        })
        .on("error", error => {
          reject(error);
          return;
        });
    });
  }

  static async fetchBuffer(url: string): Promise<Buffer> {
    const options = new URL(url);

    console.debug(`Requesting ${options.pathname} from ${options.host}...`);
    return new Promise((resolve, reject) => {
      https
        .get(options, response => {
          response.setEncoding("binary");
          console.debug(` ? ${options.host} responded with: ${response.statusCode}`);

          const dataBuffer = new Array<Buffer>();

          response.on("data", chunk => {
            dataBuffer.push(Buffer.from(chunk, "binary"));
            return;
          });

          response.on("end", () => {
            const binary = Buffer.concat(dataBuffer);
            console.debug(` = Received complete binary document (${binary.length} bytes).`);
            resolve(binary);
          });
        })
        .on("error", error => {
          reject(error);
          return;
        });
    });
  }
}
