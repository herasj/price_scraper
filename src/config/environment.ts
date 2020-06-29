import { IEnvironment } from '../interfaces/environment.interface';
require("dotenv").config(); 

export const environment: IEnvironment ={
 MONGO_URI: process.env.MONGO_URI,
 TARGET_URL: process.env.TARGET_URL
}