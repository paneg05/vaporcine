import { spawn } from "child_process";

// A promise wrapper around child_process.spawn.
// By default it DOES NOT enforce a timeout or kill the child process.
// To enable a timeout, pass `options.timeout` (ms) > 0.
// Usage: promisseWrapper(cmd, args = [], { timeout: ms })
const promisseWrapper = (cmd, args = [], options = {}) => {
  const timeoutMs =
    typeof options.timeout === "number" && options.timeout > 0
      ? options.timeout
      : null; // no timeout by default

  const proc = spawn(cmd, args);
  let stdout = "";
  let stderr = "";
  let finished = false;

  return new Promise((resolve, reject) => {
    const killAndResolve = (reason) => {
      if (finished) return;
      finished = true;
      try {
        proc.kill();
      } catch (e) {
        // ignore
      }
      try {
        if (process.platform === "win32" && proc.pid) {
          spawn("taskkill", ["/PID", String(proc.pid), "/T", "/F"]);
        }
      } catch (e) {
        // ignore
      }
      resolve({
        code: -1,
        stdout,
        stderr: stderr + `\n[ffpromisseWrapper] killed: ${reason}`,
      });
    };

    let timer = null;
    if (timeoutMs) {
      timer = setTimeout(() => {
        killAndResolve("timeout");
      }, timeoutMs);
    }

    if (proc.stdout) {
      proc.stdout.on("data", (data) => {
        const s = data.toString();
        // forward ffmpeg stdout to process stdout so logs appear
        try {
          process.stdout.write(s);
        } catch (e) {
          // ignore
        }
        stdout += s;
      });
    }

    if (proc.stderr) {
      proc.stderr.on("data", (data) => {
        const s = data.toString();
        // forward ffmpeg stderr to process stderr so logs appear
        try {
          process.stderr.write(s);
        } catch (e) {
          // ignore
        }
        stderr += s;
      });
    }

    proc.on("close", (code) => {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });

    proc.on("error", (err) => {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      reject(err);
    });
  });
};

export default promisseWrapper;
