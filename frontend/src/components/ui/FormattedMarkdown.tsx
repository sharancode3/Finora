import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines to format lists and blocks cleanly
  const lines = content.split('\n');

  return (
    <div className={`space-y-1.5 ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        // Bullet list item (* or -)
        const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
        const itemContent = isBullet ? trimmed.replace(/^(\*|-|•)\s+/, '') : line;

        // Render inline markdown formatting (bold, code)
        const formattedTokens = renderInlineTokens(itemContent);

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E293B] shrink-0 mt-1.5" />
              <div className="flex-1 leading-relaxed">{formattedTokens}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="leading-relaxed">
            {formattedTokens}
          </p>
        );
      })}
    </div>
  );
};

// Parses **bold** and `code` safely into React nodes
function renderInlineTokens(text: string): React.ReactNode[] {
  // Regex splitting by bold (**...**) and code (`...`)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-semibold text-slate-800 border border-slate-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}
