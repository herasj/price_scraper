import { IProduct } from "../interfaces/product.interface";
import { writeFileSync, appendFileSync } from "fs";
import { launch, Page, Browser } from "puppeteer";
import { union } from "lodash";

export class AlkostoService {
  private readonly startUrl: string;
  private browser: Browser | null;
  private page: Page | null;
  private data: IProduct[];

  constructor() {
    this.startUrl = "https://www.alkosto.com/electro";
    this.browser = null;
    this.page = null;
    this.data = [];
  }

  private setup = async (): Promise<void> => {
    this.browser = await launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 },
    });
    this.page = await this.browser.newPage();
    await this.goToUrl(this.startUrl);
  };

  private goToUrl = async (url: string): Promise<void> => {
    await this.page.goto(url, { waitUntil: "networkidle0" });
  };

  private takeScreenshot = async (): Promise<void> => {
    await this.page.screenshot({
      path: `${process.cwd()}/screenshots/${Date.now()}.png`,
    });
  };

  private getProducts = async () => {
    await this.page.waitForSelector('[class="products-grid last even"] > li > div > a');
    const items = await this.page.$$(
      '[class="products-grid last even"] > li > div > a'
    );
    const data = [];
    for await (let item of items) {
      const link = await (await item.getProperty("href")).jsonValue();
      const title = await (await item.getProperty("title")).jsonValue();
      data.push({ link: `${link}`, title: `${title}` });
    }
    console.log('\n\n')
    this.data = union(this.data, data)
    console.dir(this.data)
  };

  private nextPage = async () => {
    await this.page.click('[class="next i-next"]');
    await this.getProducts();
  };

  private productInfo = async() => {
      for await(const item of this.data) {
        await this.page.goto(item.link, { waitUntil: "networkidle0" });
        await this.page.waitForSelector('[class="price-old"]')
      }
  }
  
  public extractData = async (): Promise<void> => {
    const pages = [2, 3, 4, 5];
    await this.setup();
    await this.takeScreenshot();
    await this.getProducts();
    for await (const page of pages) {
      console.dir(page);
      await this.nextPage();
      console.log("endpage");
    }
    console.dir(this.data)
    for (const item of this.data) {
      appendFileSync(
        `${process.cwd()}/lista.txt`,
        `${item.title}\n${item.link}\n\n`
      );
    }
    await this.browser.close();
  };
}
