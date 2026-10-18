import type { Print } from '../engine/mount.ts';

export interface SceneRec {
  kind: 'ch'; el: HTMLElement; i: number; stage: HTMLElement; plate: HTMLElement; cv: HTMLCanvasElement;
  lis: HTMLElement[]; n: number; glyph: string; pattern: string; angle: number; motif: string; seed: number;
  bar: string; p: number; print: Print | null; inked: number; sc: number; pin: boolean; sh: number;
}
export interface YearRec {
  kind: 'yr'; el: HTMLElement; y: string; cv: HTMLCanvasElement; text: HTMLElement; bar: string; p: number; print: Print | null;
}
export type Rec = SceneRec | YearRec;
