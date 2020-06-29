import { launch, Page } from "puppeteer";
import { writeFileSync } from "fs";
export class AlkostoService {
  private readonly startUrl: string;
  private page: Page | null;
  constructor() {
    this.page = null;
    this.startUrl = "https://www.alkosto.com/electro";
  }

  private setup = async (): Promise<void> => {
    const browser = await launch({ headless: true,defaultViewport:{ width: 1920, height: 1080 } });
    this.page = await browser.newPage();
    await this.goToUrl(this.startUrl);
  };

  private goToUrl = async (url: string): Promise<void> => {
    await this.page.goto(url, { waitUntil: "networkidle0" });
  };

  private takeScreenshot = async (): Promise<void> => {
    await this.page.screenshot({ path: `${process.cwd()}/screenshots/${Date.now()}.png` });
  };

  private getProducts = async () => {
      const ul = await this.page.$('[class="products-grid last even"]')
      writeFileSync(`${process.cwd()}/lista.txt`,ul.toString())
      console.dir(ul)
  }
  

  public extractData = async (): Promise<void> => {
    await this.setup();
    await this.takeScreenshot();
    await this.getProducts();
  };
}
