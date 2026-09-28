import { getDb } from "./db";

export interface Project {
  title: string;
  description: string;
  tags: string[];
  github?: string;
  live?: string;
  status: "active" | "wip" | "archived";
  year: number;
}

export async function getProjects(): Promise<Project[]> {
  const db = await getDb();
  return db
    .collection<Project>("projects")
    .find({}, { projection: { _id: 0 } })
    .sort({ year: -1 })
    .toArray();
}
