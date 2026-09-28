import { getPosts } from "@/lib/posts";
import BlogList from "@/components/blog-list";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <main className="blog-layout">
      <div className="container">
        <div className="eyebrow">Writing</div>
        <h1 style={{ fontSize: "clamp(40px, 7vw, 68px)", marginBottom: 12 }}>Notes &amp; essays</h1>
        <p className="page-intro">A searchable notebook of things I am trying to understand.</p>
        <BlogList posts={posts} manage />
      </div>
    </main>
  );
}
