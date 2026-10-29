'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

export interface PipelineStep {
  key: string;
  label: string;
  count: number;
  /** Dossiers de cette étape qui attendent une action. */
  waiting: number;
  href: string;
}

const STEP_DELAY_MS = 150;
const COUNT_DURATION_MS = 750;

function useCountUp(target: number, delay: number) {
  const [value, setValue] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      current.current = target;
      setValue(target);
      return;
    }
    const from = current.current;
    const t0 = performance.now() + delay;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(Math.max((now - t0) / COUNT_DURATION_MS, 0), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(from + (target - from) * eased);
      current.current = next;
      setValue(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delay]);

  return value;
}

function Node({ step, index }: { step: PipelineStep; index: number }) {
  const delay = index * STEP_DELAY_MS;
  const shown = useCountUp(step.count, delay);

  return (
    <li
      className={`fx-node${step.count === 0 ? ' is-empty' : ''}`}
      style={{ '--i': index, '--delay': `${delay}ms` } as CSSProperties}
    >
      <Link href={step.href} className="fx-node-link">
        <span className="fx-dot" aria-hidden="true" />
        <span className="fx-node-count" aria-label={`${step.count} dossiers`}>
          {shown}
        </span>
        <span className="fx-node-label">{step.label}</span>
        {step.waiting > 0 && <span className="fx-node-wait">{step.waiting} en attente</span>}
      </Link>
    </li>
  );
}

export default function StepPipeline({ steps }: { steps: PipelineStep[] }) {
  return (
    <ol className="fx-pipe" aria-label="Dossiers par étape">
      {steps.map((s, i) => (
        <Node key={s.key} step={s} index={i} />
      ))}
    </ol>
  );
}