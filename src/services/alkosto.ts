import { IProduct } from "../interfaces/product.interface";
import { ProductModel } from "../models/product.model";
import { SingleBar, Presets, Bar } from "cli-progress";
import { environment } from "../config/environment";
import { writeFileSync, appendFileSync } from "fs";
import { launch, Page, Browser } from "puppeteer";
import { union } from "lodash";

export class AlkostoService {
  private readonly startUrl: string;
  private browser: Browser | null;
  private page: Page | null;
  private data: IProduct[];

  constructor() {
    this.startUrl = `${environment.TARGET_URL}`;
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

  private scrollAndWait = async () => {
    await this.page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    await this.page.waitFor(1000);
  };

  private getProducts = async () => {
    await this.page.waitForSelector(
      '[class="products-grid last even"] > li > div > a'
    );
    const items = await this.page.$$(
      '[class="products-grid last even"] > li > div > a'
    );
    await this.page.waitFor(1000);
    const data = [];
    for await (let item of items) {
      const link = await (await item.getProperty("href")).jsonValue();
      const title = await (await item.getProperty("title")).jsonValue();
      data.push({ link: `${link}`, title: `${title}` });
    }
    this.data = union(this.data, data);
  };

  private nextPage = async () => {
    await this.page.click('[class="next i-next"]');
    await this.getProducts();
  };

  private productInfo = async () => {
    let cont = 0;
    let errors = 0;
    const bar = new SingleBar({}, Presets.shades_classic);
    const newData = [];
    console.log(
      `Getting information about ${this.data.length} products .... \n\n`
    );
    bar.start(this.data.length, 0);
    for await (const item of this.data) {
      try {
        await this.page.goto(item.link, {
          waitUntil: "networkidle0",
        });
        let prices;
        let selector = '[itemprop="price"]';
        if (!(await this.page.$(selector))) selector = '[class="price"]';
        if (await this.page.$('[class="price-old"]')) {
          prices = await this.page.evaluate((selector) => {
            const oldPrice = document.querySelector('[class="price-old"]')
              .textContent;
            const newPrice = document.querySelector(selector).textContent;
            return {
              oldPrice: `${oldPrice}`.substring(2),
              newPrice: `${newPrice}`,
            };
          }, selector);
          if (selector === '[class="price"]')
            prices.newPrice = prices.newPrice.substring(4);
        } else {
          prices = await this.page.evaluate((selector) => {
            const newPrice = document.querySelector(selector).textContent;
            return {
              oldPrice: `N/A`,
              newPrice: `${newPrice}`,
            };
          }, selector);
          if (selector === '[class="price"]')
            prices.newPrice = prices.newPrice.substring(4);
        }
        newData.push({ ...item, ...prices });
      } catch (error) {
        console.dir(`Error on  ${item.title}: ${error}`);
        errors++;
      }
      cont++;
      bar.update(cont);
    }
    console.log(
      `Errors: ${errors}/${this.data.length}, ${errors / this.data.length} %`
    );
    this.data = newData;
  };

  private uploadData = async () => {
    let cont = 0;
    let errors = 0;
    const bar = new SingleBar({}, Presets.shades_classic);
    console.log(`Uploading ${this.data.length} documents .... \n\n`);
    bar.start(this.data.length, 0);
    for await (const item of this.data) {
      try {
          await ProductModel.create(item);
      } catch (error) {
        console.dir(`Error on ${item.title}: ${error}`);
        errors++;
      }
      cont++;
      bar.update(cont);
      //   console.log(`${cont}/${this.data.length}`);
      // 
    }
    console.log(`Success :) ${errors} \n Errors\n\n`);
  };

  public extractData = async (): Promise<void> => {
    const pages = new Array(39);
    await this.setup();
    console.log("Setup completed !");
    await this.takeScreenshot();
    console.log("Getting Products ....");
    await this.getProducts();
    console.log("Products saved :)");
    for await (const page of pages) {
      console.log("Loading new page ....");
      await this.nextPage();
    }
    console.log("Getting More Info ....");
    await this.productInfo();
    console.log("More infomation added ;)");
    await this.uploadData();
    await this.browser.close();
  };
}

// for (const item of this.data) {
//   appendFileSync(
//     `${process.cwd()}/lista.txt`,
//     `${item.title}\n${item.link}\n\n`
//   );
// }
