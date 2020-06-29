import { Schema, model } from "mongoose";
const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    price: { type: String, required: true },
    dcto: { type: String, required: true },
  },
  { id: false, timestamps: true, versionKey: false }
);

export const ProductModel = model('Products',ProductSchema)