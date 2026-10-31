import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// staticAssetsIncrementalCache reads cached pages from Workers static assets
// embedded at build time — zero KV writes, zero risk of hitting the free-tier
// 1,000 daily KV write limit.
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  queue: memoryQueue,
});
