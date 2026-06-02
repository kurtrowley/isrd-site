// useSystemicSimulation — the heart of every lab.
// Manages attractor states, feedback graph, and the simulation tick loop.

import { useRef, useCallback, useEffect } from 'react';
import { FeedbackLoop } from './FeedbackLoop';
import { AttractorBasin, type BasinConfig } from './AttractorBasin';
import type { AttractorState, FeedbackGraph, SimAdjustment } from './types';

export interface SimHookOptions {
  tickMs?: number;           // milliseconds per tick (default 50)
  basinConfig?: Partial<BasinConfig>;
  onTick?: (state: AttractorState, graph: FeedbackGraph, tick: number) => void;
}

export interface SimHookResult {
  loop: FeedbackLoop;
  basin: AttractorBasin;
  start: () => void;
  stop: () => void;
  reset: () => void;
  applyAdjustment: (adj: SimAdjustment) => void;
  isRunning: () => boolean;
}

export function useSystemicSimulation(options: SimHookOptions = {}): SimHookResult {
  const { tickMs = 50, basinConfig, onTick } = options;

  const loopRef   = useRef(new FeedbackLoop());
  const basinRef  = useRef(new AttractorBasin(basinConfig));
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef   = useRef(0);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const tick = useCallback(() => {
    tickRef.current++;
    const graph = loopRef.current.getGraph();
    const state = basinRef.current.step(graph);
    onTickRef.current?.(state, graph, tickRef.current);
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(tick, tickMs);
  }, [tick, tickMs]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    tickRef.current = 0;
    basinRef.current.reset();
  }, [stop]);

  const applyAdjustment = useCallback((adj: SimAdjustment) => {
    loopRef.current.setNodeValue(
      adj.nodeId,
      loopRef.current.getNodeValue(adj.nodeId) + adj.delta,
    );
  }, []);

  const isRunning = useCallback(() => timerRef.current !== null, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return {
    loop: loopRef.current,
    basin: basinRef.current,
    start,
    stop,
    reset,
    applyAdjustment,
    isRunning,
  };
}
