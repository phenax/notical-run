import { createEffect, createRoot } from 'solid-js';
import { QuickJSHandle, VmCallResult } from 'quickjs-emscripten-core';
import { Editor } from '@tiptap/core';
import { EvalEngine, EvalNodeOptions } from '@/engine/types';
import { Result } from './result';

const findMarkById = (editor: Editor, id: string): [number, number] | null => {
  let foundNodePos = null;
  editor.state.doc.content.descendants((node, pos) => {
    if (node.isText) {
      const mark = node.marks.find(m => m.attrs?.nodeId === id);
      if (mark) {
        foundNodePos = [pos, node.nodeSize];
        return false;
      }
    }
  });

  return foundNodePos;
};

export const evalExpression = async (
  code: string,
  {
    options,
    engine,
    onResult,
    handleCleanup,
  }: {
    onResult: (res: Result<Error, any>) => void;
    engine: EvalEngine;
    handleCleanup: (cleanup: () => void) => void;
    options: EvalNodeOptions;
  },
) => {
  const quickVM = engine.quickVM;

  const toResult = (result: VmCallResult<QuickJSHandle>): Result<Error, any> => {
    try {
      if (result.error) {
        throw result.error.consume(quickVM.dump);
      }

      if (quickVM.typeof(result.value) === 'function') {
        return Result.ok(() => {
          quickVM.callFunction(result.value, quickVM.global);
        });
      }

      return Result.ok(result.value.consume(quickVM.dump));
    } catch (error) {
      console.error(error);
      return Result.err(error as Error);
    }
  };

  createRoot(dispose => {
    handleCleanup(dispose);

    createEffect(async () => {
      const nodePosAndSize = engine.withEditor(editor => findMarkById(editor, options.id));

      const hereRef = JSON.stringify({
        pos: nodePosAndSize?.[0] ?? options.pos,
        nodeSize: nodePosAndSize?.[1] ?? options.nodeSize,
        id: options.id,
        __native__: '',
      });
      const evalResult = await quickVM.evalCodeAsync(
        `{
const here = () => {
  _internals.listenToUpdate();
  return ${hereRef};
};

${code}
}`,
        'global.js',
        { strict: false },
      );
      onResult(toResult(evalResult));
    });
  });
};
