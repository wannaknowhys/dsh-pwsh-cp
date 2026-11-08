// dsh-pwsh-cp — pin the PowerShell console to UTF-8 for every shell call.
//
// Why: the harness decodes command output as UTF-8, but a pwsh process on a
// zh-CN host starts with the console at the OEM code page (936) and the .NET
// `[Console]::OutputEncoding` assignment in the shipped preamble does not move
// the console code page to 65001. Native tools therefore write GBK bytes into
// a UTF-8 decoder and every non-ASCII character is lost. Setting the console
// code page once per call makes CMD built-ins answer in ASCII/English and
// makes console-code-page-aware tools (dir, Everything's es.exe) emit UTF-8.
//
// This bundle does NOT replace `pwsh-sandbox`: it decorates the prototype's
// `argv()` so the sandbox wrapper still builds and confines every invocation.
// If anything here fails, the shipped behaviour is untouched.

const PREAMBLE = "chcp 65001 *> $null; $env:PYTHONUTF8='1'; $env:PYTHONIOENCODING='utf-8'; ";
const MARK = Symbol.for('dsh-pwsh-cp.installed');

export const name = 'pwsh-cp';
export const inject = ['shell'];

/** Wrap one argv-producing method in place, idempotently. */
function decorate(target) {
  if (!target || typeof target.argv !== 'function') return false;
  if (target.argv[MARK] === true) return true;
  const original = target.argv;
  const wrapped = function argv(spec) {
    const argv = original.call(this, spec);
    try {
      if (Array.isArray(argv) && argv.length >= 6 && typeof argv[5] === 'string' && !argv[5].startsWith(PREAMBLE)) {
        argv[5] = PREAMBLE + argv[5];
      }
    } catch {
      // Never break a command because decoration failed.
    }
    return argv;
  };
  Object.defineProperty(wrapped, MARK, { value: true });
  target.argv = wrapped;
  return true;
}

export function apply(ctx) {
  try {
    const shell = ctx.shell;
    if (!shell) return;
    // `argv` is a prototype method of the executor class; patching the
    // prototype is independent of which object `ctx.shell` resolves to.
    const proto = Object.getPrototypeOf(shell);
    if (decorate(proto)) return;
    decorate(shell);
  } catch {
    // Registration must never take the shell service down.
  }
}
