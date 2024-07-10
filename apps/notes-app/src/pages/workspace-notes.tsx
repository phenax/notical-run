import { A, useParams } from '@solidjs/router';
import { useWorkspaceNotes } from '../api/queries/workspace';
import { Page } from '../components/Page';
import { links } from '../components/Navigation';
import { For, Show } from 'solid-js';

type Params = {
  workspaceSlug: string;
};

const WorkspaceNotes = () => {
  const { workspaceSlug } = useParams<Params>();
  const slug = workspaceSlug.replace(/^@/, '');
  const notesResult = useWorkspaceNotes(slug);

  return (
    <Page breadcrumbs={[{ text: <>@{slug}</> }]}>
      <Show when={!notesResult.isLoading} fallback={<div>Loading...</div>}>
        <For each={notesResult.data} fallback={<div>No notes</div>}>
          {note => (
            <A
              href={links.workspaceNote(slug, note.id)}
              class="block px-4 py-3 shadow-sm rounded-md border border-gray-100 mb-2 text-slate-700"
            >
              <div>
                {note.name}
                <span class="text-slate-900 font-bold pl-2">
                  @{slug}/{note.id}
                </span>
              </div>
            </A>
          )}
        </For>
      </Show>
    </Page>
  );
};

export default WorkspaceNotes;