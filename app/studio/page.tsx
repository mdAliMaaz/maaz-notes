import Studio from "@/components/studio";
import { getPostMarkdown } from "@/lib/posts";

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const markdown = edit ? getPostMarkdown(edit) : undefined;
  return <Studio initialMarkdown={markdown} originalSlug={edit} />;
}
