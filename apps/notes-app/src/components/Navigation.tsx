export const links = {
  workspaces: () => '/workspaces',
  workspaceNotes: (slug: string) => `/@${slug}`,
  workspaceNote: (slug: string, noteId: string) => `/@${slug}/${noteId}`,
  login: () => '/login',
  signup: () => '/signup',
  logout: () => '/logout',
};
