import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import type { Base24Colors, TabKey } from '../types/index.ts';

// Convert our Base24 colors to react-syntax-highlighter theme
const createBase24Theme = (colors: Base24Colors) => ({
  'code[class*="language-"]': {
    color: colors.base05,
    background: colors.base00,
    fontFamily:
      '"Maple Mono", "Maple Mono NF", "JetBrains Mono", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    direction: 'ltr' as const,
    textAlign: 'left' as const,
    whiteSpace: 'pre' as const,
    wordSpacing: 'normal',
    wordBreak: 'normal' as const,
    MozTabSize: '2',
    OTabSize: '2',
    tabSize: '2',
    WebkitHyphens: 'none' as const,
    MozHyphens: 'none' as const,
    msHyphens: 'none' as const,
    hyphens: 'none' as const,
  },
  'pre[class*="language-"]': {
    color: colors.base05,
    background: colors.base00,
    fontFamily:
      '"Maple Mono", "Maple Mono NF", "JetBrains Mono", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    direction: 'ltr' as const,
    textAlign: 'left' as const,
    whiteSpace: 'pre' as const,
    wordSpacing: 'normal',
    wordBreak: 'normal' as const,
    MozTabSize: '2',
    OTabSize: '2',
    tabSize: '2',
    WebkitHyphens: 'none' as const,
    MozHyphens: 'none' as const,
    msHyphens: 'none' as const,
    hyphens: 'none' as const,
    padding: '1rem',
    margin: '0',
    overflow: 'auto',
    borderRadius: '0.5rem',
    border: `1px solid ${colors.base02}`,
  },

  // Comments
  comment: { color: colors.base03, fontStyle: 'italic' },
  prolog: { color: colors.base03, fontStyle: 'italic' },
  doctype: { color: colors.base03, fontStyle: 'italic' },
  cdata: { color: colors.base03, fontStyle: 'italic' },

  // Punctuation
  punctuation: { color: colors.base05 },

  // Constants
  boolean: { color: colors.base09 },
  number: { color: colors.base09 },
  constant: { color: colors.base09 },
  symbol: { color: colors.base09 },

  // Strings
  string: { color: colors.base0B },
  char: { color: colors.base0B },

  // Identifiers
  property: { color: colors.base08 },
  tag: { color: colors.base08 },
  variable: { color: colors.base08 },

  // Functions
  function: { color: colors.base0D },
  'function-name': { color: colors.base0D },

  // Keywords and Statements
  keyword: { color: colors.base0E, fontWeight: 'bold' },
  statement: { color: colors.base0E },
  conditional: { color: colors.base0E },
  repeat: { color: colors.base0E },
  label: { color: colors.base0A },
  operator: { color: colors.base05 },

  // Types
  'class-name': { color: colors.base0A },
  type: { color: colors.base0A },

  // Special
  selector: { color: colors.base0C },
  'attr-name': { color: colors.base0C },
  builtin: { color: colors.base0C },
  inserted: { color: colors.base0B },
  deleted: { color: colors.base08 },

  atrule: { color: colors.base0A },
  'attr-value': { color: colors.base0B },

  regex: { color: colors.base0C },
  important: { color: colors.base0F, fontWeight: 'bold' },

  namespace: { opacity: 0.7 },

  // Language specific
  'language-css .token.string': { color: colors.base0B },
  '.style .token.string': { color: colors.base0B },
});
// Clean, simple code examples
const CODE_EXAMPLES: Record<string, string> = {
  javascript: `// JavaScript - React Hook with Custom State
import { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash'

const useCounter = (initialValue = 0, step = 1) => {
  const [count, setCount] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)

  const increment = useCallback(() => {
    setCount(prev => prev + step)
  }, [step])

  useEffect(() => {
    if (count > 10) {
      console.log(\`High count: \${count}\`)
    }
  }, [count])

  return { count, increment, isLoading }
}`,

  python: `# Python - Advanced Data Processing Pipeline
import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class DataProcessor:
    threshold: float = 0.5
    batch_size: int = 1000
    debug: bool = False

    def process_batch(self, data: List[Dict]) -> pd.DataFrame:
        """Process a batch of data with filtering and validation."""
        df = pd.DataFrame(data)
        filtered = df[df['score'] > self.threshold]

        if self.debug:
            print(f"Filtered {len(filtered)} rows from {len(df)}")

        return filtered`,

  cpp: `// C++ - Generic Container with Smart Pointers
#include <iostream>
#include <vector>
#include <memory>
#include <algorithm>

template<typename T>
class DataContainer {
private:
    std::vector<std::unique_ptr<T>> data_;
    size_t capacity_;

public:
    DataContainer(size_t initial_capacity = 10)
        : capacity_(initial_capacity) {
        data_.reserve(capacity_);
    }

    void emplace(T&& item) {
        data_.push_back(std::make_unique<T>(std::move(item)));
    }

    size_t size() const { return data_.size(); }
};`,

  terminal: `❯ ls -la
drwxr-xr-x 3 user staff    96 Dec 15 10:30 projects/
drwxr-xr-x 5 user staff   160 Dec 14 14:22 .git/
-rw-r--r-- 1 user staff  1.2K Dec 15 09:15 README.md
-rw-r--r-- 1 user staff   847 Dec 14 16:30 package.json
-rwxr-xr-x 1 user staff  2.1K Dec 15 08:45 build.sh

❯ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes)
        modified:   src/components/ThemeGenerator.tsx
        modified:   src/utils/colorUtils.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        themes/lumina-midnight.json
        themes/lumina-dawn.json

no changes added to commit (use "git add" and/or "git commit -a")

❯ nvim init.lua
-- Opening Neovim with your new theme!`,
};

interface SyntaxPreviewProps {
  colors: Base24Colors;
  language: TabKey;
}

const SyntaxPreview: React.FC<SyntaxPreviewProps> = ({ colors, language }) => {
  // Map our language names to react-syntax-highlighter language names
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
