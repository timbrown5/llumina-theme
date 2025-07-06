export interface Base24Colors {
  base00: string;
  base01: string;
  base02: string;
  base03: string;
  base04: string;
  base05: string;
  base06: string;
  base07: string;
  base08: string;
  base09: string;
  base0A: string;
  base0B: string;
  base0C: string;
  base0D: string;
  base0E: string;
  base0F: string;
  base10: string;
  base11: string;
  base12: string;
  base13: string;
  base14: string;
  base15: string;
  base16: string;
  base17: string;
}

export type AccentColorKey =
  | 'base08'
  | 'base09'
  | 'base0A'
  | 'base0B'
  | 'base0C'
  | 'base0D'
  | 'base0E'
  | 'base0F';

export type BaseColorKey =
  | 'base00'
  | 'base01'
  | 'base02'
  | 'base03'
  | 'base04'
  | 'base05'
  | 'base06'
  | 'base07';

export type MutedColorKey =
  | 'base10'
  | 'base11'
  | 'base12'
  | 'base13'
  | 'base14'
  | 'base15'
  | 'base16'
  | 'base17';

export type Base24ColorKey = BaseColorKey | AccentColorKey | MutedColorKey;

export interface Base24Scheme {
  name: string;
  scheme: 'base24';
  author: string;
  colors: Base24Colors;
}
