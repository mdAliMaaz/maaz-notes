import { getPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = (await getPosts()).map(({ slug, title, description, tags, date }) => ({
    slug, title, description, tags, date,
  }));
  return Response.json(posts);
}
