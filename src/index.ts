require("dotenv").config();
import { connection } from "./database/mongo";
import { AlkostoService } from "./services/alkosto";

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
    });
  }
}

new Main().start();
