// src/models/types.ts
export interface Actor {
  id: string;
  name: string;
  color: string;
  desc: string;
  layer: string;
}

export interface Step {
  from: string;
  to: string;
  label: string;
  desc: string;
  detail: string;
  actor: string;
  term?: string;
}

export interface Flow {
  title: string;
  description: string;
  hierarchy: string;
  actors: Actor[];
  steps: Step[];
}

export type FlowType = 'inbound' | 'outbound' | 'return' | 'storage';
