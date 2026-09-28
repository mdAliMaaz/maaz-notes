"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  function copy() {
    const text = ref.current?.innerText ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="code-block-wrapper">
      <pre ref={ref} {...props}>{children}</pre>
      <button className="copy-btn" onClick={copy} aria-label="Copy code">
        {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
