import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

export type PlatformName =
  | "Instagram"
  | "Facebook"
  | "Twitter/X"
  | "TikTok"
  | "Pinterest"
  | "LinkedIn";

@modelOptions({
  schemaOptions: {
    collection: "pp_platforms",
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
})
export class Platform extends TimeStamps {
  @prop({ type: String, required: true })
  platformName!: PlatformName;

  @prop({ type: Boolean, required: false, default: false })
  isConnected?: boolean;

  // Mock OAuth token stored for demo
  @prop({ type: String, required: false, default: "" })
  accessToken?: string;

  @prop({ type: String, required: false, default: "" })
  accountUsername?: string;

  @prop({ type: Date, required: false })
  connectedAt?: Date;
}

export const PlatformModel = getModelForClass(Platform);
