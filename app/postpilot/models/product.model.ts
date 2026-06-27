import { prop, getModelForClass, modelOptions, index } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

@modelOptions({
  schemaOptions: {
    collection: "pp_products",
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
})
@index({ createdAt: -1 })
export class Product extends TimeStamps {
  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, required: false, default: "" })
  imageUrl?: string;

  @prop({ type: String, required: false, default: "" })
  description?: string;

  @prop({ type: String, required: true })
  price!: string;

  @prop({ type: String, required: false, default: "" })
  purchaseLink?: string;

  @prop({ type: Number, required: false, default: 0 })
  rotationOrder?: number;

  @prop({ type: Boolean, required: false, default: true })
  isActive?: boolean;
}

export const ProductModel = getModelForClass(Product);
