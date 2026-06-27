import { PlatformModel, type PlatformName } from "../models/platform.model";

const ALL_PLATFORMS: PlatformName[] = [
  "Instagram",
  "Facebook",
  "Twitter/X",
  "TikTok",
  "Pinterest",
  "LinkedIn",
];

export const platformService = {
  async ensureAllPlatforms() {
    for (const name of ALL_PLATFORMS) {
      const existing = await PlatformModel.findOne({ platformName: name });
      if (!existing) {
        await PlatformModel.create({
          platformName: name,
          isConnected: false,
          accessToken: "",
          accountUsername: "",
        });
      }
    }
  },

  async list() {
    await platformService.ensureAllPlatforms();
    return PlatformModel.find().sort({ platformName: 1 }).lean();
  },

  async connect(platformName: PlatformName, username: string) {
    return PlatformModel.findOneAndUpdate(
      { platformName },
      {
        $set: {
          isConnected: true,
          accessToken: `mock_token_${platformName.toLowerCase().replace(/[^a-z]/g, "_")}_${Date.now()}`,
          accountUsername: username,
          connectedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    ).lean();
  },

  async disconnect(platformName: PlatformName) {
    return PlatformModel.findOneAndUpdate(
      { platformName },
      {
        $set: {
          isConnected: false,
          accessToken: "",
          accountUsername: "",
          connectedAt: undefined,
        },
        $unset: { connectedAt: "" },
      },
      { new: true }
    ).lean();
  },

  async getConnected() {
    return PlatformModel.find({ isConnected: true }).lean();
  },
};
