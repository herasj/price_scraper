import { IMongoProduct } from "../interfaces/product.interface";
import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true, trim: true },
    oldPrice: { type: String, required: true, trim: true },
    newPrice: { type: String, required: true, trim: true },
  },
  { id: false, timestamps: true, versionKey: false }
);

export const ProductModel = model<IMongoProduct>("Products", ProductSchema);
