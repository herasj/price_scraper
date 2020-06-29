import { connect } from "mongoose";
const url = `${process.env.MONGO_URI}`;
const options = { 
  useNewUrlParser: true ,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
}

export const connection = connect(url, options)