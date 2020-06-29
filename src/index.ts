import { AlkostoService } from "./services/alkosto";
import { connection } from "./database/mongo";

class Main {
  alkostoService: AlkostoService;
  constructor() {
    this.alkostoService = new AlkostoService();
  }
  start() {
    connection
      .then(async () => {
        console.log("Connected to database");
        await this.alkostoService.extractData();
        console.log("END");
        console.log("-----------------------");
        process.exit();
      })
      .catch((error) => {
        console.dir(`Error: ${error}`);
        console.log('Ending ........');
        console.log("-----------------------");
        process.exit();
      });
  }
}
console.log("\n-----------------------");
console.log("Date: " + new Date());
new Main().start();
