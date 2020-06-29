import { IMongoProduct } from "../interfaces/product.interface";
import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    oldPrice: { type: String, required: true },
    newPrice: { type: String, required: true },
  },
  { id: false, timestamps: true, versionKey: false }
);

export const ProductModel = model<IMongoProduct>('Products',ProductSchema)