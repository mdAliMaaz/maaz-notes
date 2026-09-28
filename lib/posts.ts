import { getDb } from "./db";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
};

export async function getPosts(): Promise<Post[]> {
  const db = await getDb();
  return db
    .collection<Post>("posts")
    .find({}, { projection: { _id: 0 } })
    .sort({ date: -1 })
    .toArray();
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const db = await getDb();
  const post = await db
    .collection<Post>("posts")
    .findOne({ slug }, { projection: { _id: 0 } });
  return post ?? undefined;
}

export async function getPostMarkdown(slug: string): Promise<string | undefined> {
  const post = await getPost(slug);
  if (!post) return undefined;
  const tagsStr = post.tags.map((t) => `"${t}"`).join(", ");
  return `---\ntitle: "${post.title}"\ndescription: "${post.description}"\ndate: "${post.date}"\ntags: [${tagsStr}]\n---\n\n${post.content}`;
}
