import type { ComponentType, ReactNode } from "react";

export interface CapyExampleEntry {
  props?: Record<string, unknown>;
  disabled?: boolean;
  notes?: string[];
  render?: (Component: ComponentType<any>) => ReactNode;
}

// This file is yours. Capy never overwrites it after the first scaffold.
// Add demo props or custom render wrappers for components that need real-ish data.
export const capyExamples: Record<string, CapyExampleEntry> = {
  // Button: {
  //   props: { children: "Save changes", variant: "primary" },
  // },
};
