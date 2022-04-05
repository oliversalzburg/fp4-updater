import https from "https";

export class Fetcher {
  static async fetchHtml(): Promise<string> {
    const options = {
      host: "code.fairphone.com",
      port: 443,
      path: "/projects/fairphone-4-kernel.html",
    };

    console.debug(`Requesting ${options.path} from ${options.host}:${options.port}...`);
    return new Promise((resolve, reject) => {
      https
        .get(options, response => {
          console.debug(`${options.host} responded with: ${response.statusCode}`);

          const dataBuffer = new Array<string>();

          response.on("data", chunk => {
            dataBuffer.push(chunk);
            return;
          });

          response.on("end", () => {
            console.debug("Received complete document.");
            resolve(dataBuffer.join(""));
          });
        })
        .on("error", error => {
          reject(error);
          return;
        });
    });
  }
}
