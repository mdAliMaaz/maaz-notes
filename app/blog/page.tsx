import { getPosts } from "@/lib/posts";
import BlogList from "@/components/blog-list";

export default function BlogPage() {
  const posts = getPosts();
  return <main className="blog-layout"><div className="container">
    <div className="eyebrow">Writing</div><h1 style={{ fontSize: 56 }}>Notes & essays</h1>
    <p className="page-intro">A searchable notebook of things I am trying to understand.</p>
    <BlogList posts={posts} manage />
  </div></main>;
}
