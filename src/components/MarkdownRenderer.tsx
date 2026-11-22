import React from "react";
import Link from "next/link";
import type { ListItemNode, MarkdownBlock } from "@/lib/blog";

function renderInlineSegment(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const tokenRegex =
    /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let tokenIdx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const key = `${keyPrefix}-${tokenIdx++}`;

    if (match[2] && match[3]) {
      const label = match[2];
      const href = match[3].trim();
      const isInternal = href.startsWith("/") || href.startsWith("#");
      if (isInternal) {
        nodes.push(
          <Link
            key={key}
            href={href}
            className="font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-2 transition-colors hover:text-indigo-800"
          >
            {label}
          </Link>
        );
      } else {
        nodes.push(
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-2 transition-colors hover:text-indigo-800"
          >
            {label}
          </a>
        );
      }
    } else if (match[4]) {
      nodes.push(
        <code
          key={key}
          className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.875em] font-semibold text-indigo-700"
        >
          {match[4]}
        </code>
      );
    } else if (match[5]) {
      nodes.push(
        <strong key={key} className="font-bold italic text-slate-900">
          {renderInlineSegment(match[5], `${key}-bi`)}
        </strong>
      );
    } else if (match[6]) {
      nodes.push(
        <strong key={key} className="font-bold text-slate-950">
          {renderInlineSegment(match[6], `${key}-b`)}
        </strong>
      );
    } else if (match[7]) {
      nodes.push(
        <em key={key} className="italic text-slate-700">
          {renderInlineSegment(match[7], `${key}-i`)}
        </em>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderRichText(text: string, keyPrefix: string): React.ReactNode {
  const parts = text.split(/<br\s*\/?>/gi);
  if (parts.length === 1) {
    return renderInlineSegment(text, keyPrefix);
  }
  return parts.map((part, idx) => (
    <React.Fragment key={`${keyPrefix}-br-${idx}`}>
      {idx > 0 && <br />}
      {renderInlineSegment(part, `${keyPrefix}-seg-${idx}`)}
    </React.Fragment>
  ));
}

function renderListItems(items: ListItemNode[], keyPrefix: string) {
  return items.map((item, idx) => (
    <li key={`${keyPrefix}-li-${idx}`} className="leading-relaxed text-slate-700">
      <div>{renderRichText(item.text, `${keyPrefix}-li-${idx}`)}</div>
      {item.quote && (
        <blockquote className="mt-2.5 rounded-xl border-l-4 border-indigo-500 bg-indigo-50/60 px-4 py-3 text-sm leading-relaxed text-slate-800">
          {renderRichText(item.quote, `${keyPrefix}-quote-${idx}`)}
        </blockquote>
      )}
      {item.children && item.children.length > 0 && (
        <ul className="mt-2 space-y-1.5 pl-5 list-disc marker:text-indigo-500">
          {renderListItems(item.children, `${keyPrefix}-sub-${idx}`)}
        </ul>
      )}
    </li>
  ));
}

interface MarkdownRendererProps {
  blocks: MarkdownBlock[];
}

export function MarkdownRenderer({ blocks }: MarkdownRendererProps) {
  return (
    <div className="space-y-5 text-[15px] leading-relaxed text-slate-700 sm:text-base sm:leading-7">
      {blocks.map((block, index) => {
        const key = `block-${index}`;

        switch (block.type) {
          case "heading":
            if (block.level === 2) {
              return (
                <h2
                  key={key}
                  id={block.id}
                  className="scroll-mt-24 border-b border-slate-200 pb-2.5 pt-6 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={key}
                id={block.id}
                className="scroll-mt-24 pt-3 text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
              >
                {block.text}
              </h3>
            );

          case "paragraph":
            return (
              <p key={key} className="leading-relaxed text-slate-700">
                {renderRichText(block.text, key)}
              </p>
            );

          case "list":
            if (block.ordered) {
              return (
                <ol
                  key={key}
                  className="space-y-2.5 pl-5 list-decimal marker:font-bold marker:text-indigo-600"
                >
                  {renderListItems(block.items, key)}
                </ol>
              );
            }
            return (
              <ul
                key={key}
                className="space-y-2.5 pl-5 list-disc marker:text-indigo-500"
              >
                {renderListItems(block.items, key)}
              </ul>
            );

          case "table":
            return (
              <div
                key={key}
                className="my-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs"
              >
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      {block.headers.map((header, hIdx) => (
                        <th
                          key={`${key}-h-${hIdx}`}
                          scope="col"
                          className="px-4 py-3.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap sm:text-sm"
                        >
                          {renderRichText(header, `${key}-h-${hIdx}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {block.rows.map((row, rIdx) => (
                      <tr
                        key={`${key}-r-${rIdx}`}
                        className={rIdx % 2 === 1 ? "bg-slate-50/70" : "bg-white"}
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={`${key}-r-${rIdx}-c-${cIdx}`}
                            className="align-top px-4 py-3.5 text-xs leading-relaxed text-slate-700 sm:text-sm"
                          >
                            {renderRichText(cell, `${key}-r-${rIdx}-c-${cIdx}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "code":
            return (
              <div
                key={key}
                className="my-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-md"
              >
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <span>{block.language || "Sơ đồ vận hành hệ thống"}</span>
                  <span className="text-sky-400">Tổ Chức Nhân Viên AI</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-sky-100 sm:p-5 sm:text-[13px]">
                  <code>{block.content}</code>
                </pre>
              </div>
            );

          case "blockquote":
            return (
              <blockquote
                key={key}
                className="my-5 rounded-2xl border-l-4 border-indigo-600 bg-indigo-50/70 px-5 py-4 text-sm leading-relaxed text-slate-800 sm:text-base"
              >
                {block.lines.map((line, lIdx) => (
                  <p key={`${key}-q-${lIdx}`} className={lIdx > 0 ? "mt-2" : ""}>
                    {renderRichText(line, `${key}-q-${lIdx}`)}
                  </p>
                ))}
              </blockquote>
            );

          case "hr":
            return <hr key={key} className="my-7 border-slate-200" />;
        }
      })}
    </div>
  );
}
