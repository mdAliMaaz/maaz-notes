"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import Mermaid from "@/components/mermaid";
import CodeBlock from "@/components/code-block";

export default function Markdown({ content }: { content: string }) {
  return <div className="prose">
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeHighlight]}
      components={{
        pre: CodeBlock,
        code({ className, children, ...props }) {
          const language = /language-(\w+)/.exec(className || "")?.[1];
          const value = String(children).replace(/\n$/, "");
          if (language === "mermaid") return <Mermaid chart={value} />;
          return <code className={className} {...props}>{children}</code>;
        }
      }}
    >{content}</ReactMarkdown>
  </div>;
}
