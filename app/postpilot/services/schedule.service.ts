import { ScheduleModel } from "../models/schedule.model";

export const scheduleService = {
  async get() {
    let schedule = await ScheduleModel.findOne({ _singleton: true }).lean();
    if (!schedule) {
      const created = await ScheduleModel.create({
        _singleton: true,
        postingTime: "09:00",
        timezone: "UTC",
        isEnabled: false,
      });
      schedule = created.toObject();
    }
    return schedule;
  },

  async update(data: {
    postingTime?: string;
    timezone?: string;
    isEnabled?: boolean;
  }) {
    return ScheduleModel.findOneAndUpdate(
      { _singleton: true },
      { $set: data },
      { new: true, upsert: true }
    ).lean();
  },

  async updateLastPosted(productId: string) {
    return ScheduleModel.findOneAndUpdate(
      { _singleton: true },
      { $set: { lastPostedProductId: productId, lastRunAt: new Date() } },
      { new: true }
    ).lean();
  },
};
