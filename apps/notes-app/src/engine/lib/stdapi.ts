import { getInternalsHandle, toQuickJSHandle } from '@/engine/quickjs';
import { QuickJSContextOptions } from '@/engine/types';
import { QuickJSAsyncContext, Scope } from 'quickjs-emscripten-core';

export const registerStdApiLib = async (
  quickVM: QuickJSAsyncContext,
  options: QuickJSContextOptions,
) => {
  quickVM
    .unwrapResult(
      await quickVM.evalCodeAsync(
        `{ Object.defineProperty(globalThis, 'console', { value: {}, writable: false }); }`,
      ),
    )
    .dispose();

  return Scope.withScope(scope => {
    const consoleObj = scope.manage(quickVM.getProp(quickVM.global, 'console'));
    const internals = scope.manage(getInternalsHandle(quickVM));

    toQuickJSHandle(quickVM, (...args: any[]) => {
      console.log('[vm]', ...args);
    }).consume(f => quickVM!.setProp(consoleObj, 'log', f));

    toQuickJSHandle(quickVM, (...args: Parameters<typeof setTimeout>) => {
      const timer = setTimeout(...args);
      options.addCleanup(() => clearTimeout(timer));
      return timer;
    }).consume(f => quickVM.setProp(quickVM.global, 'setTimeout', f));

    toQuickJSHandle(quickVM, (...args: Parameters<typeof setInterval>) => {
      const timer = setInterval(...args);
      options.addCleanup(() => clearInterval(timer));
      return timer;
    }).consume(f => quickVM.setProp(quickVM.global, 'setInterval', f));

    toQuickJSHandle(quickVM, clearInterval).consume(f =>
      quickVM.setProp(quickVM.global, 'clearInterval', f),
    );

    toQuickJSHandle(quickVM, clearTimeout).consume(f =>
      quickVM.setProp(quickVM.global, 'clearTimeout', f),
    );

    toQuickJSHandle(quickVM, (date: string, ...args: any[]) =>
      Intl.DateTimeFormat(...args).format(new Date(date)),
    ).consume(f => quickVM.setProp(internals, 'formatDateTime', f));
  });
};