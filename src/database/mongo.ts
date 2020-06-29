import { connect } from "mongoose";
import { environment } from "../config/environment";

const options = { 
  useNewUrlParser: true ,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
}

console.dir(environment)
export const connection = connect(environment.MONGO_URI, options)