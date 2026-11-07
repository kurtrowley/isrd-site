export interface SimParam {
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface Sim {
  id: string;
  label: string;
  description: string;
  params: Record<string, SimParam>;
  init(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void;
  step(): void;
  draw(ctx: CanvasRenderingContext2D): void;
  resize(w: number, h: number): void;
  setParam(key: string, value: number): void;
  stats(): Record<string, string | number>;
  // Optional: canvas-pixel click coordinates, for sims with clickable elements
  // (e.g. node explainer popups). SimRunner forwards raw clicks here and
  // redraws once so the result is visible immediately, even while paused.
  onClick?(x: number, y: number): void;
}
