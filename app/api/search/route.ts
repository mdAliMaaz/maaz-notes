import { getPosts } from "@/lib/posts";

export function GET() {
  const posts = getPosts().map(({ slug, title, description, tags, date }) => ({
    slug, title, description, tags, date,
  }));
  return Response.json(posts);
}
