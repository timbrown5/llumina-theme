import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Base24Colors, TabKey } from '../types/index.ts';

// Override theme colors instead of creating entire theme from scratch
const createBase24Theme = (colors: Base24Colors) => ({
  ...oneDark,
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    color: colors.base05,
    background: colors.base00,
    fontFamily: '"JetBrains Mono", Consolas, Monaco, "Andale Mono", monospace',
  },
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: colors.base00,
    border: `1px solid ${colors.base02}`,
  },
  comment: { color: colors.base03, fontStyle: 'italic' },
  string: { color: colors.base0B },
  number: { color: colors.base09 },
  boolean: { color: colors.base09 },
  keyword: { color: colors.base0E, fontWeight: 'bold' },
  function: { color: colors.base0D },
  'function-name': { color: colors.base0D },
  variable: { color: colors.base08 },
  property: { color: colors.base08 },
  'class-name': { color: colors.base0A },
  operator: { color: colors.base05 },
  punctuation: { color: colors.base05 },
});

const CODE_EXAMPLES: Record<string, string> = {
  javascript: `// React Hook with State Management
import { useState, useEffect } from 'react'

const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount(prev => prev + 1)

  useEffect(() => {
    console.log(\`Count: \${count}\`)
  }, [count])

  return { count, increment }
}`,

  python: `# Data Processing Pipeline
import pandas as pd
from typing import List, Optional

class DataProcessor:
    def __init__(self, threshold: float = 0.5):
        self.threshold = threshold

    def process(self, data: List[dict]) -> pd.DataFrame:
        """Filter and process data."""
        df = pd.DataFrame(data)
        return df[df['score'] > self.threshold]`,

  cpp: `// Modern C++ with Smart Pointers
#include <memory>
#include <vector>

template<typename T>
class Container {
private:
    std::vector<std::unique_ptr<T>> data_;

public:
    void add(T&& item) {
        data_.push_back(std::make_unique<T>(std::move(item)));
    }

    size_t size() const { return data_.size(); }
};`,

  terminal: `❯ git status
On branch main
Changes not staged for commit:
  modified: src/components/ThemeGenerator.tsx
  modified: src/utils/colorUtils.ts

❯ npm run build
✓ Build successful

❯ git add . && git commit -m "Optimize codebase"
[main abc123] Optimize codebase
 2 files changed, 50 insertions(+), 150 deletions(-)`,
};

interface SyntaxPreviewProps {
  colors: Base24Colors;
  language: TabKey;
}

const SyntaxPreview: React.FC<SyntaxPreviewProps> = ({ colors, language }) => {
  const languageMap: Record<string, string> = {
    terminal: 'bash',
    cpp: 'cpp',
    javascript: 'javascript',
    python: 'python',
  };

  const code = CODE_EXAMPLES[language] || CODE_EXAMPLES.javascript;
  const syntaxLanguage = languageMap[language] || language;
  const theme = createBase24Theme(colors);

  return (
    <SyntaxHighlighter
      language={syntaxLanguage}
      style={theme}
      customStyle={{
        margin: 0,
        fontSize: '0.875rem',
        lineHeight: '1.5',
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default SyntaxPreview;
