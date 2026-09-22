import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/posts";
import Markdown from "@/components/markdown";

export function generateStaticParams() { return getPosts().map(post => ({ slug: post.slug })); }

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return <main className="blog-layout"><article className="article">
    <header className="article-header"><div className="meta"><span>{post.date}</span>{post.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
      <div className="article-title-row"><div><h1>{post.title}</h1><p>{post.description}</p></div><Link className="btn" href={`/studio?edit=${encodeURIComponent(post.slug)}`}>Edit note</Link></div>
    </header>
    <Markdown content={post.content} />
  </article></main>;
}
