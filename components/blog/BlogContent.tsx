import { Fragment } from "react";

// Minimal markdown-ish renderer for our blog post content: supports
// "## " headings, "- " bullet lists, "**bold**" spans, and blank-line
// separated paragraphs. Intentionally lightweight — no external markdown
// dependency for a handful of static SEO posts.
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>;
  });
}

export function BlogContent({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\s*\n/);
  let listBuffer: string[] = [];
  const nodes: React.ReactNode[] = [];

  function flushList(key: string) {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul key={key} className="list-disc space-y-1 pl-6">
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item, `${key}-li-${i}`)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  }

  blocks.forEach((block, idx) => {
    const lines = block.split("\n").map((l) => l.trim());
    const isList = lines.every((l) => l.startsWith("- "));

    if (isList) {
      listBuffer.push(...lines.map((l) => l.replace(/^- /, "")));
      return;
    }
    flushList(`list-${idx}`);

    if (block.startsWith("## ")) {
      nodes.push(
        <h2 key={idx} className="text-2xl font-bold text-espresso">
          {block.replace(/^## /, "")}
        </h2>
      );
      return;
    }

    nodes.push(<p key={idx}>{renderInline(block, `p-${idx}`)}</p>);
  });
  flushList("list-final");

  return <div className="prose-content space-y-5 text-espresso/80 leading-relaxed">{nodes}</div>;
}
