import { Document } from "mongoose";

export interface IProduct {
    title?: string;
    link?: string;
    oldPrice?: string;
    newPrice?: string;
}
export interface IMongoProduct extends Document{
    title?: string;
    link?: string;
    oldPrice?: string;
    newPrice?: string;
}