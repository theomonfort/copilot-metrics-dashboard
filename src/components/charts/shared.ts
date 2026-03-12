export const LANGUAGE_COLORS: Record<string, string> = {
  typescript: '#3178c6',
  javascript: '#f1e05a',
  python: '#3572A5',
  java: '#b07219',
  go: '#00ADD8',
  rust: '#dea584',
  csharp: '#178600',
  'c#': '#178600',
  cpp: '#f34b7d',
  'c++': '#f34b7d',
  c: '#555555',
  ruby: '#701516',
  php: '#4F5D95',
  swift: '#F05138',
  kotlin: '#A97BFF',
  scala: '#DC322F',
  html: '#e34c26',
  css: '#563d7c',
  shell: '#89e051',
  bash: '#89e051',
  markdown: '#083fa1',
  sql: '#e38c00',
  r: '#198CE7',
  dart: '#00B4AB',
  lua: '#000080',
  vue: '#41b883',
  yaml: '#cb171e',
  json: '#292929',
  unknown: '#8b8b8b',
};

const DISPLAY_NAMES: Record<string, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  go: 'Go',
  rust: 'Rust',
  csharp: 'C#',
  'c#': 'C#',
  cpp: 'C++',
  'c++': 'C++',
  c: 'C',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  html: 'HTML',
  css: 'CSS',
  shell: 'Shell',
  bash: 'Bash',
  markdown: 'Markdown',
  sql: 'SQL',
  r: 'R',
  dart: 'Dart',
  lua: 'Lua',
  vue: 'Vue',
  yaml: 'YAML',
  json: 'JSON',
};

export function capitalize(name: string): string {
  const lower = name.toLowerCase();
  if (DISPLAY_NAMES[lower]) return DISPLAY_NAMES[lower];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export const FEATURE_LABELS: Record<string, string> = {
  code_completion: 'Code Completion',
  inline_chat: 'Inline Chat',
  chat_panel: 'Chat Panel',
  agent_edit: 'Agent Edit',
};

/** Palette for stacked charts when we need N distinct colors. */
export const STACK_PALETTE = [
  '#3178c6',
  '#f1e05a',
  '#3572A5',
  '#00ADD8',
  '#b07219',
  '#dea584',
  '#F05138',
  '#A97BFF',
  '#178600',
  '#f34b7d',
  '#701516',
  '#4F5D95',
];
