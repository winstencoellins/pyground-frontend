import { RUN_TIMEOUT_MS, WORKER_URL } from "./config";

export type OutputChunk = [kind: "out" | "err", text: string];
export type RunStatus = "ok" | "error" | "input" | "limit" | "timeout" | "stopped" | "crash" | "offline";
export type RunResult = { status: RunStatus; out: OutputChunk[] };

// One worker shared by every playground on the page. Killing it is the only way to stop a run
// (no SharedArrayBuffer), so a timeout or Stop costs a reload of Python from the browser cache.
let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let loaded = false;
let cancel: ((r: RunResult) => void) | null = null;
let queue: Promise<unknown> = Promise.resolve();
let nextId = 0;

function kill() {
  worker?.terminate();
  worker = null;
  ready = null;
  loaded = false;
}

/** Starts loading Python (e.g. when an editor gets focus) so the first run is faster. */
export function warmUp() {
  if (worker) return;
  const w = new Worker(WORKER_URL, { type: "module" });
  worker = w;
  ready = new Promise<void>((resolve, reject) => {
    w.addEventListener("message", (e) => {
      if (e.data.type === "ready") resolve();
      if (e.data.type === "load-error") reject(new Error(e.data.message));
    });
    w.addEventListener("error", (e) => reject(e));
  }).then(() => {
    loaded = true;
  });
  ready.catch(() => {
    if (worker === w) kill();
  });
}

export function stopPython() {
  cancel?.({ status: "stopped", out: [] });
}

/** Runs one program; runs from several playgrounds wait their turn. */
export function runPython(
  code: string,
  inputs: string[],
  seed: number,
  onPhase: (phase: "loading" | "running") => void,
): Promise<RunResult> {
  const job = queue.then(() => execute(code, inputs, seed, onPhase));
  queue = job.catch(() => {});
  return job;
}

async function execute(code: string, inputs: string[], seed: number, onPhase: (p: "loading" | "running") => void) {
  warmUp();
  const w = worker!;
  if (!loaded) {
    onPhase("loading");
    // Stop during a slow first download gives up on this run; Python keeps loading for the next one.
    const stopped = new Promise<RunResult>((resolve) => {
      cancel = resolve;
    });
    const early = await Promise.race([
      ready!.then(
        () => null,
        (e) => {
          console.error("Pyground: Python failed to load", e);
          return { status: "offline", out: [] } satisfies RunResult;
        },
      ),
      stopped,
    ]);
    cancel = null;
    if (early) return early;
  }
  onPhase("running");
  const id = ++nextId;
  return new Promise<RunResult>((resolve) => {
    const finish = (r: RunResult) => {
      clearTimeout(timer);
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
      cancel = null;
      resolve(r);
    };
    const stop = (r: RunResult) => {
      kill();
      finish(r);
    };
    const onMessage = (e: MessageEvent) => {
      if (e.data.type === "result" && e.data.id === id) finish({ status: e.data.status, out: e.data.out });
    };
    // A wasm crash (e.g. very deep recursion) kills the worker's Python; start fresh next time.
    const onError = () => stop({ status: "crash", out: [] });
    const timer = setTimeout(() => stop({ status: "timeout", out: [] }), RUN_TIMEOUT_MS);
    cancel = stop;
    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    w.postMessage({ id, code, inputs, seed });
  });
}
