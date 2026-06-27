import { PostHistoryModel, type PostStatus } from "../models/post-history.model";

export const postHistoryService = {
  async list(limit = 50, skip = 0) {
    return PostHistoryModel.find()
      .sort({ postedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  },

  async count() {
    return PostHistoryModel.countDocuments();
  },

  async create(data: {
    productId: string;
    productName: string;
    productImageUrl?: string;
    caption?: string;
    platformResults: Array<{
      platform: string;
      status: "success" | "failed";
      error?: string;
    }>;
    postedAt: Date;
  }) {
    const successCount = data.platformResults.filter((r) => r.status === "success").length;
    const failedCount = data.platformResults.filter((r) => r.status === "failed").length;

    let overallStatus: PostStatus = "success";
    if (successCount === 0) overallStatus = "failed";
    else if (failedCount > 0) overallStatus = "partial";

    return PostHistoryModel.create({
      ...data,
      overallStatus,
    });
  },

  async getStats() {
    const total = await PostHistoryModel.countDocuments();
    const successful = await PostHistoryModel.countDocuments({ overallStatus: "success" });
    const failed = await PostHistoryModel.countDocuments({ overallStatus: "failed" });
    const partial = await PostHistoryModel.countDocuments({ overallStatus: "partial" });
    return { total, successful, failed, partial };
  },
};
