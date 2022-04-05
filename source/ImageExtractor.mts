export type BootImage = {
  build: string;
  href: string;
};

export class ImageExtractor {
  static getImages(html: string): Array<BootImage> {
    const images = new Array<BootImage>();

    // To avoid actual parsing (and dependencies), do it dirty.
    const imageLinkMatcher =
      /<li><p>build (?<build>[A]\.\d{3}): <a class="reference external" href="(?<href>[^"]*)"/g;
    const matches = html.matchAll(imageLinkMatcher);
    for (const match of matches) {
      if (!match.groups) {
        throw new Error("Regular expression did not resolve any groups!");
      }

      console.debug(`Found: ${match.groups.build} → ${match.groups.href}`);
      images.push({ build: match.groups.build, href: match.groups.href });
    }

    return images;
  }
}
