import { Node } from '@tiptap/core';
import { codeClearDelimiters } from '@/components/Editor/extensions/InlineCode/code-clear-delimtiers';
import { inlineCodeNodeView } from '@/components/Editor/extensions/InlineCode/view';

export const InlineCode = Node.create({
  name: 'code',
  inline: true,
  group: 'inline',
  content: 'text*',
  marks: '',
  defining: true,
  exitable: true,
  selectable: true,

  addAttributes() {
    return {
      result: { default: null, rendered: false, keepOnSplit: false },
    };
  },

  addStorage() {
    return {
      markdown: {
        serialize: (state: any, node: any) => state.write(node.textContent),
        parse: {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'code' }];
  },

  renderHTML() {
    return ['code', 0];
  },

  addNodeView() {
    return inlineCodeNodeView;
  },

  addInputRules() {
    return [
      {
        find: /`([^`]+)`$/g,
        handler: ({ state, range, match }) => {
          if (!match[0]) return;
          const resolvedPos = state.doc.resolve(range.from);
          if (resolvedPos.node().type === this.type) return;
          const start = range.from;
          const end = range.to;
          const newNode = this.type.create(null, state.schema.text(match[0]));
          state.tr.replaceWith(start, end, newNode);
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [codeClearDelimiters(this.type)];
  },

  addKeyboardShortcuts() {
    return {
      ArrowRight: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;
        if ($from.parent.type !== this.type) return false;
        if ($from.parent.nodeSize - $from.parentOffset - 2 > 0) return false;
        if ($from.after() === undefined) return false;

        // Insert space after node
        const nextNode = editor.state.doc.nodeAt($from.after());
        if (!nextNode) {
          if (!state.selection.empty) return false;
          const tr = editor.state.tr;
          tr.insertText(' ', $from.after());
          editor.view.dispatch(tr);
        }

        return false;
      },

      ArrowDown: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;
        if ($from.parent.type !== this.type) return false;

        // Insert paragraph after if at the end of doc
        const nextNode = editor.state.doc.nodeAt($from.after(1));
        if (!nextNode) {
          if (!state.selection.empty) return false;
          const tr = editor.state.tr;
          tr.insert($from.after(), editor.schema.nodes.paragraph.create());
          editor.view.dispatch(tr);
        }

        return false;
      },
    };
  },
});
