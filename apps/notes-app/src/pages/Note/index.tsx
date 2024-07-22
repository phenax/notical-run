import { useNavigate, useParams } from '@solidjs/router';
import { useNote } from '../../api/queries/workspace';
import { Page } from '../../components/Page';
import { Match, Show, Switch } from 'solid-js';
import { useWorkspaceContext } from '@/layouts/workspace';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { NoteSidebar } from '@/pages/Note/components/Sidebar';
import { NoteEditor } from '@/pages/Note/components/NoteEditor';
import { LoadingView, ErrorView } from '@/components/ViewStates';
import { toApiErrorMessage } from '@/utils/api-client';
import { links } from '@/components/Navigation';
import { NoteActionsDropdown } from '@/components/Note/NoteDropdown';
import { IfAuthenticated } from '@/components/Auth/Session';
import { Alert } from '@/components/_base/Alert';

const WorkspaceNote = () => {
  const { slug } = useWorkspaceContext();
  const params = useParams<{ noteId: string }>();
  const noteQuery = useNote(slug, () => params.noteId);
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    const formatter = new Intl.DateTimeFormat('en-UK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatter.format(new Date(date));
  };

  return (
    <Page title={`@${slug()}/${params.noteId}`}>
      <Page.Header
        breadcrumbs={[
          { content: <WorkspaceSelector selected={slug()} /> },
          { content: <>{noteQuery.data?.name ?? '-'}</> },
        ]}
      />
      <Page.Body>
        <IfAuthenticated>
          <Page.Body.SideMenu>
            <NoteSidebar />
          </Page.Body.SideMenu>
        </IfAuthenticated>

        <Page.Body.Main>
          <Switch>
            <Match when={noteQuery.isLoading}>
              <LoadingView />
            </Match>

            <Match when={noteQuery.isError}>
              <ErrorView title={toApiErrorMessage(noteQuery.error) ?? undefined} />
            </Match>

            <Match when={noteQuery.isSuccess}>
              <div class="px-2">
                <div class="mx-auto max-w-4xl">
                  <Show when={noteQuery.data?.archivedAt}>
                    <Alert variant="warning" class="mb-3">
                      This note was archived on: {formatDate(noteQuery.data!.archivedAt!)}
                    </Alert>
                  </Show>

                  <div class="flex justify-end items-center gap-2 text-sm text-slate-500">
                    @{slug()}/{noteQuery.data?.name} by {noteQuery.data?.author?.name}
                    <IfAuthenticated>
                      <NoteActionsDropdown
                        workspaceSlug={slug()}
                        noteId={noteQuery.data!.name!}
                        onArchive={() => navigate(links.workspaceNotes(slug()))}
                      />
                    </IfAuthenticated>
                  </div>

                  <Show when={noteQuery.data?.id} keyed>
                    <NoteEditor note={noteQuery.data!} />
                  </Show>
                </div>
              </div>
            </Match>
          </Switch>
        </Page.Body.Main>
      </Page.Body>
    </Page>
  );
};

export default WorkspaceNote;
