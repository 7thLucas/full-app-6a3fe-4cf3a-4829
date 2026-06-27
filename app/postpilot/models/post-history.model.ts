import { prop, getModelForClass, modelOptions, index } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

export type PostStatus = "success" | "failed" | "partial";

class PlatformResult {
  @prop({ type: String, required: true })
  platform!: string;

  @prop({ type: String, required: true, enum: ["success", "failed"] })
  status!: "success" | "failed";

  @prop({ type: String, required: false })
  error?: string;
}

@modelOptions({
  schemaOptions: {
    collection: "pp_post_history",
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
})
@index({ postedAt: -1 })
export class PostHistory extends TimeStamps {
  @prop({ type: String, required: true })
  productId!: string;

  @prop({ type: String, required: true })
  productName!: string;

  @prop({ type: String, required: false, default: "" })
  productImageUrl?: string;

  @prop({ type: String, required: false, default: "" })
  caption?: string;

  @prop({ type: () => [PlatformResult], required: false, default: [] })
  platformResults?: PlatformResult[];

  @prop({
    type: String,
    required: true,
    enum: ["success", "failed", "partial"],
    default: "success",
  })
  overallStatus!: PostStatus;

  @prop({ type: Date, required: true })
  postedAt!: Date;
}

export const PostHistoryModel = getModelForClass(PostHistory);
