export type BoardTask = {
  id: string;
  code: string;
  name: string;
  status: string;
  date: string;
  assignee: string;
  fields: { priority?: string; project?: string };
};
