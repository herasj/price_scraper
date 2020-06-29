import { IProduct } from "../interfaces/product.interface";
import { ProductModel } from "../models/product.model";
import { writeFileSync, appendFileSync } from "fs";
import { launch, Page, Browser } from "puppeteer";
import { SingleBar, Presets, Bar } from "cli-progress";
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

  private scrollAndWait = async() => {
    await this.page.evaluate(() => {
      window.scrollBy(0,window.innerHeight);
    });
    await this.page.waitFor(1000);
  }
  
  private getProducts = async () => {
    await this.page.waitForSelector(
      '[class="products-grid last even"] > li > div > a'
    );
    const items = await this.page.$$(
      '[class="products-grid last even"] > li > div > a'
    );
    await this.page.waitFor(1000)
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
          timeout: 100000,
        });
        await this.page.waitForSelector('[class="price-old"]');
        await this.page.waitForSelector('[itemprop="price"]');
        const prices = await this.page.evaluate(() => {
          const oldPrice = document.querySelector('[class="price-old"]')
            .textContent;
          const newPrice = document.querySelector('[itemprop="price"]')
            .textContent;
          return {
            oldPrice: `${oldPrice}`.substring(2),
            newPrice: `${newPrice}`,
          };
        });
        newData.push({ ...item, ...prices });
      } catch (error) {
        console.dir(`Timeout on product: ${item.title}`);
        errors++;
      }
      cont++;
      bar.update(cont);
      //   console.log(`${cont}/${this.data.length}`);
      //   console.log(`${errors} Errors \n`);
    }
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
        if (await ProductModel.exists({ title: item.title })) {
          await ProductModel.findOneAndUpdate({ title: item.title }, item);
        } else {
          await ProductModel.create(item);
        }
      } catch (error) {
        console.dir(`Error on ${item.title}: ${error}`);
        errors++;
      }
      cont++;
      bar.update(cont);
      //   console.log(`${cont}/${this.data.length}`);
      console.log(`${errors} \n Errors\n\n`);
    }
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
      console.log('Loading new page ....')
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
