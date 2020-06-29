import { AlkostoService } from "./services/alkosto";
import { connection } from "./database/mongo";

class Main {
  alkostoService: AlkostoService;
  constructor() {
    this.alkostoService = new AlkostoService();
  }
  start() {
    connection.then(async () => {
      console.log("Connected to database");
      await this.alkostoService.extractData();
      console.log("END");
    })
    .catch((error) => {
      console.dir(`Error on db connection: ${error}`)
    }
    )
  }
}

new Main().start();
