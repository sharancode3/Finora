import React from 'react';
import { ShieldCheck, BookOpen, TrendingUp, Info, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

/**
 * Production-Grade Structured Markdown Renderer for Finora AI Chat & Copilot
 * Parses headers, tables, callouts, key-value pills, citations, and inline tokens with high-contrast styling.
 */
export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ 
  content, 
  className = '', 
  isUser = false 
}) => {
  if (!content) return null;

  const rawLines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // 1. Empty lines
    if (!trimmed) {
      blocks.push(<div key={`space-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // 2. Horizontal Divider (--- or ***)
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push(
        <hr key={`hr-${i}`} className={`my-2.5 border-t ${isUser ? 'border-slate-700' : 'border-slate-200'}`} />
      );
      i++;
      continue;
    }

    // 3. Grounded Citation / Source Footer (*Verified Grounded Source:...* or *Source:...*)
    if ((trimmed.startsWith('*Verified Grounded Source:') || trimmed.startsWith('*Source:') || trimmed.startsWith('_Verified Grounded Source:')) && trimmed.endsWith('*')) {
      const cleanCitation = trimmed.replace(/^(\*|_)|(\*|_)$/g, '');
      blocks.push(
        <div key={`cite-${i}`} className="mt-2.5 p-2.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[11px] font-semibold text-[#15803D] flex items-center gap-2 shadow-2xs">
          <ShieldCheck size={14} className="shrink-0 text-[#15803D]" />
          <span>{cleanCitation}</span>
        </div>
      );
      i++;
      continue;
    }

    // 4. Markdown Table Detection (| Header 1 | Header 2 | ...)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < rawLines.length && rawLines[i + 1].includes('|-')) {
      const tableLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith('|')) {
        tableLines.push(rawLines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0].split('|').map(c => c.trim()).filter(c => c.length > 0);
        // tableLines[1] is separator |---|---|
        const dataRows = tableLines.slice(2).map(row => 
          row.split('|').map(c => c.trim()).filter(c => c.length > 0)
        );

        blocks.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  {headerCells.map((h, hIdx) => (
                    <th key={hIdx} className="py-2.5 px-3.5 whitespace-nowrap">
                      {renderInlineTokens(h, isUser)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3.5 whitespace-nowrap text-slate-800">
                        {renderInlineTokens(cell, isUser)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 5. Header 1 (# Title)
    if (trimmed.startsWith('# ')) {
      const text = trimmed.replace(/^#\s+/, '');
      blocks.push(
        <h2 key={`h1-${i}`} className={`text-base font-bold tracking-tight mt-3 mb-1.5 pb-1 border-b ${isUser ? 'text-white border-slate-700' : 'text-slate-900 border-slate-200'}`}>
          {renderInlineTokens(text, isUser)}
        </h2>
      );
      i++;
      continue;
    }

    // 6. Header 2 (## Section)
    if (trimmed.startsWith('## ')) {
      const text = trimmed.replace(/^##\s+/, '');
      blocks.push(
        <h3 key={`h2-${i}`} className={`text-sm font-bold tracking-tight mt-2.5 mb-1 ${isUser ? 'text-white' : 'text-slate-900'}`}>
          {renderInlineTokens(text, isUser)}
        </h3>
      );
      i++;
      continue;
    }

    // 7. Header 3 (### Topic / Major Component)
    if (trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^###\s+/, '');
      blocks.push(
        <div key={`h3-${i}`} className={`flex items-center gap-2 pt-2.5 pb-1 text-xs font-bold ${isUser ? 'text-white' : 'text-slate-900'}`}>
          <div className="w-1.5 h-3.5 bg-[#1E293B] rounded-full shrink-0" />
          <h4 className="text-xs font-bold leading-tight">{renderInlineTokens(text, isUser)}</h4>
        </div>
      );
      i++;
      continue;
    }

    // 8. Header 4 (#### Plain-Language Definition / Why It Matters / Best Practice)
    if (trimmed.startsWith('#### ')) {
      const text = trimmed.replace(/^####\s+/, '');
      const lower = text.toLowerCase();

      let icon = <span className="w-1.5 h-1.5 rounded-full bg-[#1E293B] shrink-0" />;
      let badgeColor = 'text-slate-900';

      if (lower.includes('definition') || lower.includes('what is')) {
        icon = <BookOpen size={13} className="text-[#1E293B] shrink-0" />;
        badgeColor = 'text-slate-900';
      } else if (lower.includes('why it matters') || lower.includes('impact') || lower.includes('operational')) {
        icon = <TrendingUp size={13} className="text-[#15803D] shrink-0" />;
        badgeColor = 'text-[#15803D]';
      } else if (lower.includes('best practice') || lower.includes('tip') || lower.includes('actionable')) {
        icon = <ShieldCheck size={13} className="text-[#1D4ED8] shrink-0" />;
        badgeColor = 'text-[#1D4ED8]';
      }

      blocks.push(
        <div key={`h4-${i}`} className={`flex items-center gap-1.5 pt-2 pb-0.5 text-xs font-bold ${badgeColor}`}>
          {icon}
          <span>{renderInlineTokens(text, isUser)}</span>
        </div>
      );
      i++;
      continue;
    }

    // 9. Key-Value Metadata Bullet Item (e.g. • Domain Category: Cash & Working Capital)
    const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
    if (isBullet) {
      const itemText = trimmed.replace(/^(\*|-|•)\s+/, '');
      
      // Check if it is a structured key-value line: "Domain Category: ..." or "Statutory Reference: ..."
      const colonIdx = itemText.indexOf(':');
      if (colonIdx > 0 && colonIdx < 35 && !itemText.startsWith('http')) {
        const key = itemText.slice(0, colonIdx).trim();
        const val = itemText.slice(colonIdx + 1).trim();

        blocks.push(
          <div key={`kv-${i}`} className="flex items-center gap-2 py-0.5 pl-2 text-xs flex-wrap">
            <span className={`font-bold ${isUser ? 'text-slate-300' : 'text-slate-600'}`}>
              {key}:
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
              isUser 
                ? 'bg-slate-800 text-white border-slate-700' 
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}>
              {val.replace(/^"|"$/g, '')}
            </span>
          </div>
        );
        i++;
        continue;
      }

      // Standard bullet point
      blocks.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 pl-2 py-0.5 text-xs">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${isUser ? 'bg-white' : 'bg-[#1E293B]'}`} />
          <div className={`flex-1 leading-relaxed ${isUser ? 'text-white' : 'text-slate-800'}`}>
            {renderInlineTokens(itemText, isUser)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 10. Numbered List Item (1. Step one)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const num = numMatch[1];
      const itemText = numMatch[2];
      blocks.push(
        <div key={`num-${i}`} className="flex items-start gap-2 pl-1.5 py-0.5 text-xs">
          <span className={`w-4 h-4 rounded-full text-[9px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
            isUser 
              ? 'bg-slate-800 text-white border-slate-700' 
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {num}
          </span>
          <div className={`flex-1 leading-relaxed ${isUser ? 'text-white' : 'text-slate-800'}`}>
            {renderInlineTokens(itemText, isUser)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 11. Blockquote (> Note)
    if (trimmed.startsWith('> ')) {
      const quoteText = trimmed.replace(/^>\s+/, '');
      blocks.push(
        <div key={`quote-${i}`} className={`pl-3 py-1.5 border-l-2 rounded-r-xl text-xs italic my-1 ${
          isUser 
            ? 'border-slate-400 bg-slate-800 text-slate-100' 
            : 'border-[#1E293B] bg-slate-50 text-slate-700'
        }`}>
          {renderInlineTokens(quoteText, isUser)}
        </div>
      );
      i++;
      continue;
    }

    // 12. Standard Paragraph Text
    blocks.push(
      <p key={`p-${i}`} className={`leading-relaxed text-xs ${isUser ? 'text-white font-medium' : 'text-slate-800'}`}>
        {renderInlineTokens(trimmed, isUser)}
      </p>
    );
    i++;
  }

  return (
    <div className={`space-y-1.5 text-xs leading-relaxed ${className}`}>
      {blocks}
    </div>
  );
};

/**
 * Parses bold (**text**), italic (*text* / _text_), code (`code`), and currency figures safely into React nodes.
 */
function renderInlineTokens(text: string, isUser: boolean = false): React.ReactNode[] {
  // Regex splitting by bold (**...**), code (`...`), and italic (*...* or _..._)
  const parts = text.split(/(\*[\s\S]*?\*|`[\s\S]*?`|_[\s\S]*?_)/g);

  return parts.map((part, idx) => {
    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className={`font-bold ${isUser ? 'text-white font-bold' : 'text-slate-900 font-bold'}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline Code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code 
          key={idx} 
          className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold border ${
            isUser 
              ? 'bg-slate-800 text-white border-slate-700' 
              : 'bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Italic: *italic* or _italic_
    if ((part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
        (part.startsWith('_') && part.endsWith('_') && part.length >= 2)) {
      return (
        <em key={idx} className={`italic ${isUser ? 'text-slate-200' : 'text-slate-700'}`}>
          {part.slice(1, -1)}
        </em>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}
