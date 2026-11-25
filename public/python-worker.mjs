// Pyground Python runner (module worker). Served as a static file rather than bundled, because Turbopack
// only builds classic workers and Pyodide 314 needs a module worker.
// input() cannot block without SharedArrayBuffer (which needs COOP/COEP headers that would break YouTube
// embeds and Midtrans Snap), so it raises _NeedInput and the page replays the run with the answers so far.
// Pyodide version: keep in sync with src/lib/python/config.ts. #35 (CSP) must allow cdn.jsdelivr.net.
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs";

const RUNNER = `
import builtins, json, linecache, random, sys, traceback

class _NeedInput(BaseException): pass
class _TooMuch(BaseException): pass

_LIMIT = 20000

def _run(code, inputs, seed):
    out, size = [], [0]
    def emit(kind, text, check=True):
        size[0] += len(text)
        if check and size[0] > _LIMIT:
            raise _TooMuch()
        if out and out[-1][0] == kind:
            out[-1][1] += text
        else:
            out.append([kind, text])
    class W:
        def __init__(self, kind): self.kind = kind
        def write(self, text): emit(self.kind, text); return len(text)
        def flush(self): pass
    queue = list(inputs)
    def fake_input(prompt=""):
        sys.stdout.write(str(prompt))
        if not queue:
            raise _NeedInput()
        value = queue.pop(0)
        sys.stdout.write(value + "\\n")
        return value

    random.seed(seed)
    linecache.cache["main.py"] = (len(code), None, code.splitlines(True), "main.py")
    saved = sys.stdout, sys.stderr, builtins.input
    sys.stdout, sys.stderr, builtins.input = W("out"), W("err"), fake_input
    status = "ok"
    try:
        exec(compile(code, "main.py", "exec"), {"__name__": "__main__"})
    except _NeedInput:
        status = "input"
    except _TooMuch:
        status = "limit"
    except SystemExit:
        pass
    except BaseException as e:
        # Hide the runner's own frames so the traceback starts at the learner's code.
        tb = e.__traceback__
        while tb and tb.tb_frame.f_code.co_filename != "main.py":
            tb = tb.tb_next
        emit("err", "".join(traceback.format_exception(type(e), e, tb)), check=False)
        status = "error"
    finally:
        sys.stdout, sys.stderr, builtins.input = saved
    return json.dumps({"status": status, "out": out})
`;

const ready = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/" }).then((py) => {
  py.runPython(RUNNER);
  return py;
});

ready.then(
  () => postMessage({ type: "ready" }),
  (e) => postMessage({ type: "load-error", message: String(e) }),
);

onmessage = async (e) => {
  const { id, code, inputs, seed } = e.data;
  const py = await ready;
  const run = py.globals.get("_run");
  const pyInputs = py.toPy(inputs);
  try {
    postMessage({ type: "result", id, ...JSON.parse(run(code, pyInputs, seed)) });
  } catch (err) {
    postMessage({ type: "result", id, status: "crash", out: [["err", String(err)]] });
  } finally {
    pyInputs.destroy();
    run.destroy();
  }
};
