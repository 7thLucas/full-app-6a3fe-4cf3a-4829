import { platformService } from "../services/platform.service";
import { scheduleService } from "../services/schedule.service";
import { createLogger } from "~/lib/logger";

const logger = createLogger("PostPilotSeed");

export async function seedPostPilot() {
  logger.info("Seeding PostPilot data...");

  // Ensure all 6 platform records exist
  await platformService.ensureAllPlatforms();
  logger.info("Platforms initialized");

  // Ensure schedule singleton exists
  await scheduleService.get();
  logger.info("Schedule initialized");

  logger.info("PostPilot seed complete");
}

export default seedPostPilot;
