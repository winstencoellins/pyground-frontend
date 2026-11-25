/** Static module worker in /public (see the comment at its top for why it is not bundled). */
export const WORKER_URL = "/python-worker.mjs?v=314.0.7";

/** A run longer than this is stopped (infinite loops). Loading Python does not count. */
export const RUN_TIMEOUT_MS = 10_000;
