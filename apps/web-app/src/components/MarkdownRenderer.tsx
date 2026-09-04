'use client';

import React, { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// ─── Code Block with Copy Button ────────────────────────────────────────────
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  return (
    <div className="my-3 rounded-xl bg-surface-1 border border-hairline overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-surface-2/60 border-b border-hairline/60 text-[11px] font-mono text-ink-subtle">
        <span className="uppercase tracking-wider font-semibold text-primary-light">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-surface-3 text-ink-muted hover:text-ink transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-[12.5px] font-mono text-ink-muted overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Inline Markdown Formatter ──────────────────────────────────────────────
export function formatInline(text: string): React.ReactNode[] {
  if (!text) return [];
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Pattern to match bold (**text**), inline code (`code`), strikethrough (~~text~~), italic (*text* or _text_), links ([text](url))
  const inlineRegex = /(\*\*[^*]+\*\*|`[^`]+`|~~[^~]+~~|\*[^*]+\*|_([^_]+)_|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const raw = match[0];
    if (raw.startsWith('**') && raw.endsWith('**')) {
      const boldText = raw.slice(2, -2);
      parts.push(
        <strong key={key++} className="font-bold text-ink tracking-tight">
          {boldText}
        </strong>
      );
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded-md bg-surface-1/90 text-primary-light font-mono text-[12px] border border-hairline/80 font-medium"
        >
          {raw.slice(1, -1)}
        </code>
      );
    } else if (raw.startsWith('~~') && raw.endsWith('~~')) {
      parts.push(
        <del key={key++} className="line-through text-ink-subtle">
          {raw.slice(2, -2)}
        </del>
      );
    } else if ((raw.startsWith('*') && raw.endsWith('*')) || (raw.startsWith('_') && raw.endsWith('_'))) {
      parts.push(
        <em key={key++} className="italic text-ink-muted">
          {raw.slice(1, -1)}
        </em>
      );
    } else if (raw.startsWith('[') && raw.includes('](')) {
      const linkMatch = raw.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-light underline underline-offset-2 font-medium transition-colors"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// ─── Normalizer Helper ──────────────────────────────────────────────────────
function normalizeMarkdown(raw: string): string {
  if (!raw) return '';
  let content = raw.replace(/\r\n/g, '\n');

  // 1. Convert inline bullets (*, -, •) that appear after punctuation, bold, or colon into distinct lines
  content = content.replace(/([:.]|\*\*)\s+([*•-])\s+/g, '$1\n* ');
  content = content.replace(/([^\n])\s+([*•-])\s+(\*\*[^*]+\*\*)/g, '$1\n* $3');
  content = content.replace(/([^\n])\s+([*•-])\s+([A-Z])/g, '$1\n* $3');

  // 2. Convert inline numbered items (1., 2.) into distinct lines
  content = content.replace(/([:.]|\*\*)\s+(\d+\.)\s+/g, '$1\n$2 ');

  // 3. Separate summary/conclusion sentences that follow list items
  content = content.replace(
    /(\.\s+)(As explained|In summary|In conclusion|Overall|To summarize|Note:|Remember:|In short|Therefore)/g,
    '.\n\n$2'
  );

  return content;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const normalized = normalizeMarkdown(content);
  const rawLines = normalized.split('\n');

  const blocks: React.ReactNode[] = [];
  let blockKey = 0;

  // State trackers for grouping
  let currentList: { type: 'ul' | 'ol'; items: { text: string; indent: number; num?: string }[] } | null = null;
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];
  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  const flushList = () => {
    if (!currentList) return;
    const { type, items } = currentList;
    if (type === 'ol') {
      blocks.push(
        <ol key={blockKey++} className="my-2.5 space-y-2 pl-0.5">
          {items.map((item, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-2.5 text-ink/90 leading-relaxed ${
                item.indent > 0 ? 'ml-5 text-[12.5px]' : 'text-[13px] sm:text-sm'
              }`}
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-primary/15 text-primary text-[11px] font-bold shrink-0 mt-0.5 border border-primary/20">
                {item.num || idx + 1}
              </span>
              <div className="flex-1 min-w-0">{formatInline(item.text)}</div>
            </li>
          ))}
        </ol>
      );
    } else {
      blocks.push(
        <ul key={blockKey++} className="my-2.5 space-y-2 pl-0.5">
          {items.map((item, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-2.5 text-ink/90 leading-relaxed ${
                item.indent > 0 ? 'ml-5 text-[12.5px]' : 'text-[13px] sm:text-sm'
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-primary to-[#828fff] ring-2 ring-primary/25 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(94,106,210,0.5)]" />
              <div className="flex-1 min-w-0">{formatInline(item.text)}</div>
            </li>
          ))}
        </ul>
      );
    }
    currentList = null;
  };

  const flushBlockquote = () => {
    if (!inBlockquote) return;
    blocks.push(
      <blockquote
        key={blockKey++}
        className="my-2.5 pl-3.5 py-1.5 border-l-2 border-primary bg-surface-1/50 rounded-r-lg text-ink-muted italic text-[13px] sm:text-sm leading-relaxed"
      >
        {blockquoteLines.map((line, idx) => (
          <p key={idx}>{formatInline(line)}</p>
        ))}
      </blockquote>
    );
    blockquoteLines = [];
    inBlockquote = false;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // ── Code Block ──
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push(
          <CodeBlock
            key={blockKey++}
            code={codeBlockLines.join('\n')}
            language={codeBlockLang}
          />
        );
        codeBlockLines = [];
        codeBlockLang = '';
        inCodeBlock = false;
      } else {
        flushList();
        flushBlockquote();
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // ── Blank line ──
    if (!trimmed) {
      flushList();
      flushBlockquote();
      continue;
    }

    // ── Blockquote ──
    if (trimmed.startsWith('>')) {
      flushList();
      inBlockquote = true;
      blockquoteLines.push(trimmed.replace(/^>\s*/, ''));
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // ── Headers ──
    if (trimmed.startsWith('### ')) {
      flushList();
      blocks.push(
        <h4 key={blockKey++} className="font-bold text-ink text-[14px] mt-3.5 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {formatInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      blocks.push(
        <h3 key={blockKey++} className="font-extrabold text-ink text-[15px] mt-4 mb-2 pb-1 border-b border-hairline/60">
          {formatInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      blocks.push(
        <h2 key={blockKey++} className="font-extrabold text-ink text-[16px] mt-4.5 mb-2.5 pb-1.5 border-b border-hairline">
          {formatInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // ── Bullet Lists (* or - or •) ──
    const bulletMatch = line.match(/^(\s*)([*•-])\s+(.+)$/);
    if (bulletMatch) {
      if (currentList && currentList.type !== 'ul') {
        flushList();
      }
      const leadingSpaces = bulletMatch[1].length;
      const text = bulletMatch[3];
      const indent = Math.floor(leadingSpaces / 2);

      if (!currentList) {
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push({ text, indent });
      continue;
    }

    // ── Numbered Lists (1., 2., etc.) ──
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      if (currentList && currentList.type !== 'ol') {
        flushList();
      }
      const leadingSpaces = orderedMatch[1].length;
      const num = orderedMatch[2];
      const text = orderedMatch[3];
      const indent = Math.floor(leadingSpaces / 2);

      if (!currentList) {
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push({ text, indent, num });
      continue;
    }

    // ── Regular Paragraph ──
    flushList();
    blocks.push(
      <p key={blockKey++} className="my-2 text-[13px] sm:text-[13.5px] text-ink/90 leading-relaxed">
        {formatInline(line)}
      </p>
    );
  }

  flushList();
  flushBlockquote();

  return <div className={`space-y-2 text-ink ${className}`}>{blocks}</div>;
};

export default MarkdownRenderer;
