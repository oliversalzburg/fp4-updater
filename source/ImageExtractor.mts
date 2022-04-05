export type BootImage = {
  buildCode: string;
  buildNumber: number;
  gzipped: boolean;
  href: string;
};

export class ImageExtractor {
  static getImages(html: string): Array<BootImage> {
    const images = new Array<BootImage>();

    // To avoid actual parsing (and dependencies), do it dirty.
    const imageLinkMatcher =
      /<li><p>build (?<build>[A]\.(?<buildnum>\d{3})): <a class="reference external" href="(?<href>[^"]*)"/g;
    const matches = html.matchAll(imageLinkMatcher);
    for (const match of matches) {
      if (!match.groups) {
        console.warn("Regular expression did not resolve any groups!");
        continue;
      }

      images.push({
        buildCode: match.groups.build,
        buildNumber: Number(match.groups.buildnum),
        gzipped: match.groups.href.endsWith(".gz"),
        href: match.groups.href,
      });
    }

    return images;
  }
}
