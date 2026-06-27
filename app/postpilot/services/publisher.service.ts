import { productService } from "./product.service";
import { platformService } from "./platform.service";
import { scheduleService } from "./schedule.service";
import { postHistoryService } from "./post-history.service";
import { createLogger } from "~/lib/logger";

const logger = createLogger("Publisher");

function buildCaption(product: {
  name: string;
  description?: string;
  price: string;
  purchaseLink?: string;
}, template: string): string {
  return template
    .replace("{name}", product.name)
    .replace("{description}", product.description?.slice(0, 120) ?? "")
    .replace("{price}", product.price)
    .replace("{link}", product.purchaseLink ?? "");
}

async function mockPostToPlatform(
  platform: string,
  _caption: string,
  _imageUrl?: string
): Promise<{ status: "success" | "failed"; error?: string }> {
  // Simulate async posting — always succeeds in mock mode
  await new Promise((resolve) => setTimeout(resolve, 50));
  logger.info(`[MOCK] Posted to ${platform}`);
  return { status: "success" };
}

export async function getNextProductInRotation() {
  const products = await productService.list();
  const activeProducts = products.filter((p) => p.isActive !== false);
  if (!activeProducts.length) return null;

  const schedule = await scheduleService.get();
  const lastId = schedule?.lastPostedProductId;

  if (!lastId) return activeProducts[0];

  const lastIndex = activeProducts.findIndex((p) => String(p._id) === lastId);
  const nextIndex = (lastIndex + 1) % activeProducts.length;
  return activeProducts[nextIndex];
}

export async function runPublishingJob(captionTemplate: string) {
  logger.info("Running publishing job...");

  const product = await getNextProductInRotation();
  if (!product) {
    logger.warn("No active products to post. Skipping.");
    return { skipped: true, reason: "no_products" };
  }

  const connectedPlatforms = await platformService.getConnected();
  if (!connectedPlatforms.length) {
    logger.warn("No connected platforms. Skipping.");
    return { skipped: true, reason: "no_platforms" };
  }

  const caption = buildCaption(
    {
      name: product.name,
      description: product.description,
      price: product.price,
      purchaseLink: product.purchaseLink,
    },
    captionTemplate
  );

  const platformResults = await Promise.all(
    connectedPlatforms.map(async (p) => {
      const result = await mockPostToPlatform(p.platformName, caption, product.imageUrl);
      return { platform: p.platformName, ...result };
    })
  );

  const historyEntry = await postHistoryService.create({
    productId: String(product._id),
    productName: product.name,
    productImageUrl: product.imageUrl,
    caption,
    platformResults,
    postedAt: new Date(),
  });

  await scheduleService.updateLastPosted(String(product._id));

  logger.info(`Publishing job completed. Product: ${product.name}`);
  return { success: true, historyEntry, product, platformResults };
}
