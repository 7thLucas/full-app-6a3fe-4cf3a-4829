import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

@modelOptions({
  schemaOptions: {
    collection: "pp_schedule",
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
})
export class Schedule extends TimeStamps {
  @prop({ type: Boolean, required: false, default: true })
  _singleton?: boolean;

  // HH:MM format, e.g. "09:00"
  @prop({ type: String, required: false, default: "09:00" })
  postingTime?: string;

  // Timezone string e.g. "America/New_York"
  @prop({ type: String, required: false, default: "UTC" })
  timezone?: string;

  @prop({ type: Boolean, required: false, default: false })
  isEnabled?: boolean;

  // Index of last posted product (for rotation)
  @prop({ type: String, required: false })
  lastPostedProductId?: string;

  @prop({ type: Date, required: false })
  lastRunAt?: Date;
}

export const ScheduleModel = getModelForClass(Schedule);
