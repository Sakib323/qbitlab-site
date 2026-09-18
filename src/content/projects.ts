import { IS_DEV } from './site';

export type Project = {
  id: string;
  name: string;
  client: string;
  /** Which service this was (matches a name from services.ts). */
  service: string;
  summary: string;
  /** A real, checkable result. Leave null rather than estimate one. */
  result: string | null;
  /** Path under /public, e.g. "/work/acme.jpg". */
  image: string | null;
  /**
   * Drafts render in development only. Production builds drop them, so a
   * placeholder can never ship as if it were real client work.
   */
  draft: boolean;
};

const all: Project[] = [
  {
    id: 'draft-1',
    name: 'Project name',
    client: 'Client or industry',
    service: 'AI chatbots & assistants',
    summary: 'One or two sentences on the problem and what was built. Replace with a real project.',
    result: null,
    image: null,
    draft: true,
  },
  {
    id: 'draft-2',
    name: 'Project name',
    client: 'Client or industry',
    service: 'Workflow automation',
    summary: 'One or two sentences on the problem and what was built. Replace with a real project.',
    result: null,
    image: null,
    draft: true,
  },
  {
    id: 'draft-3',
    name: 'Project name',
    client: 'Client or industry',
    service: 'AI websites',
    summary: 'One or two sentences on the problem and what was built. Replace with a real project.',
    result: null,
    image: null,
    draft: true,
  },
];

export const projects = all.filter((p) => IS_DEV || !p.draft);
