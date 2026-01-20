// Types for dynamic component rendering

export interface DynamicComponent {
  type: string;
  props: Record<string, unknown>;
}

export interface DynamicComponentProps {
  component: DynamicComponent;
  onAction?: (actionId: string, params?: Record<string, unknown>) => void;
  onFormChange?: (fieldId: string, value: unknown) => void;
  formState?: Record<string, unknown>;
}
