import { ProductModel } from "../models/product.model";

export const productService = {
  async list() {
    return ProductModel.find().sort({ rotationOrder: 1, createdAt: -1 }).lean();
  },

  async getById(id: string) {
    return ProductModel.findById(id).lean();
  },

  async create(data: {
    name: string;
    imageUrl?: string;
    description?: string;
    price: string;
    purchaseLink?: string;
  }) {
    const count = await ProductModel.countDocuments();
    const product = new ProductModel({
      ...data,
      rotationOrder: count,
    });
    return product.save();
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      imageUrl: string;
      description: string;
      price: string;
      purchaseLink: string;
      rotationOrder: number;
      isActive: boolean;
    }>
  ) {
    return ProductModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
  },

  async delete(id: string) {
    return ProductModel.findByIdAndDelete(id).lean();
  },

  async reorder(productIds: string[]) {
    const ops = productIds.map((id, index) =>
      ProductModel.updateOne({ _id: id }, { $set: { rotationOrder: index } })
    );
    return Promise.all(ops);
  },
};
