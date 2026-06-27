import { createLogger } from "~/lib/logger";

const logger = createLogger("Scheduler");

let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let lastCheckedMinute = "";

/**
 * Simple minute-based scheduler that checks if it's time to post.
 * Checks every 30 seconds. If the current HH:MM matches the configured
 * posting time, it triggers the publishing job (once per minute).
 */
export function startScheduler() {
  if (schedulerTimer) {
    logger.warn("Scheduler already running. Skipping duplicate start.");
    return;
  }

  logger.info("Starting PostPilot scheduler...");

  schedulerTimer = setInterval(async () => {
    try {
      // Dynamically import to avoid circular deps at startup
      const { scheduleService } = await import("../services/schedule.service");
      const { runPublishingJob } = await import("../services/publisher.service");

      const schedule = await scheduleService.get();
      if (!schedule?.isEnabled || !schedule.postingTime) return;

      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, "0");
      const mm = String(now.getUTCMinutes()).padStart(2, "0");
      const currentMinute = `${hh}:${mm}`;

      // Only fire once per minute
      if (currentMinute === schedule.postingTime && currentMinute !== lastCheckedMinute) {
        lastCheckedMinute = currentMinute;
        logger.info(`Scheduled posting time reached: ${currentMinute}. Running job...`);

        // Default caption template
        const template =
          "Check out {name}! {description} — Only {price}. Shop now: {link}";
        const result = await runPublishingJob(template);
        logger.info(`Scheduled job result: ${JSON.stringify(result)}`);
      }
    } catch (err) {
      logger.error("Scheduler tick error:", err);
    }
  }, 30_000); // check every 30 seconds
}

export function stopScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    logger.info("Scheduler stopped.");
  }
}
