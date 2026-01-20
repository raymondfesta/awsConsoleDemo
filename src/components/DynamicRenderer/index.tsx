import React, { useMemo, useState } from 'react';
import { getComponent } from './ComponentRegistry';
import type { DynamicComponent, DynamicComponentProps } from './types';

/**
 * Process props for special components that need transformation
 */
function processProps(
  type: string,
  props: Record<string, unknown>,
  onAction?: (actionId: string, params?: Record<string, unknown>) => void,
  formState?: Record<string, unknown>,
  onFormChange?: (fieldId: string, value: unknown) => void
): Record<string, unknown> {
  const processed = { ...props };

  // Table: Convert columnDefinitions to include cell renderer
  if (type === 'Table' && Array.isArray(props.columnDefinitions)) {
    processed.columnDefinitions = (props.columnDefinitions as Array<{
      id: string;
      header: string;
      cell?: string | ((item: Record<string, unknown>) => unknown);
      width?: number | string;
      minWidth?: number | string;
    }>).map(col => ({
      ...col,
      // If cell is a string (field name), create a function to access that field
      cell: typeof col.cell === 'string'
        ? (item: Record<string, unknown>) => item[col.cell as string]
        : col.cell || ((item: Record<string, unknown>) => item[col.id]),
    }));
  }

  // Button: Handle onClick to trigger actions
  if (type === 'Button' && props.actionId && onAction) {
    processed.onClick = () => onAction(
      props.actionId as string,
      props.actionParams as Record<string, unknown>
    );
    delete processed.actionId;
    delete processed.actionParams;
  }

  // Button: Handle download actions with embedded content
  if (type === 'Button' && props.downloadAction) {
    processed.onClick = () => {
      const { filename, content, mimeType } = props.downloadAction as {
        filename: string;
        content: string;
        mimeType?: string;
      };
      const blob = new Blob([content], { type: mimeType || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    delete processed.downloadAction;
  }

  // Steps: Ensure proper step structure
  if (type === 'Steps' && Array.isArray(props.steps)) {
    processed.steps = (props.steps as Array<{
      header?: string;
      title?: string;
      status?: string;
      description?: string;
    }>).map(step => ({
      title: step.header || step.title || '',
      status: step.status || 'pending',
      description: step.description,
    }));
  }

  // KeyValuePairs: Ensure proper item structure
  if (type === 'KeyValuePairs' && Array.isArray(props.items)) {
    processed.items = (props.items as Array<{
      label: string;
      value: unknown;
    }>).map(item => ({
      label: item.label,
      value: typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value ?? ''),
    }));
  }

  // CodeEditor: Map content to value if needed
  if (type === 'CodeEditor') {
    if (props.content && !props.value) {
      processed.value = props.content;
      delete processed.content;
    }
  }

  // Input: Handle controlled state with onChange
  if (type === 'Input' && formState && onFormChange) {
    const fieldId = (props.inputId || props.name || 'input') as string;
    processed.value = formState[fieldId] ?? props.value ?? '';
    processed.onChange = ({ detail }: { detail: { value: string } }) => {
      onFormChange(fieldId, detail.value);
    };
  }

  // Textarea: Handle controlled state with onChange
  if (type === 'Textarea' && formState && onFormChange) {
    const fieldId = (props.inputId || props.name || 'textarea') as string;
    processed.value = formState[fieldId] ?? props.value ?? '';
    processed.onChange = ({ detail }: { detail: { value: string } }) => {
      onFormChange(fieldId, detail.value);
    };
  }

  // Select: Handle controlled state with onChange
  if (type === 'Select' && formState && onFormChange) {
    const fieldId = (props.inputId || props.name || 'select') as string;
    if (formState[fieldId] !== undefined) {
      processed.selectedOption = formState[fieldId];
    }
    processed.onChange = ({ detail }: { detail: { selectedOption: unknown } }) => {
      onFormChange(fieldId, detail.selectedOption);
    };
  }

  // Checkbox: Handle controlled state with onChange
  if (type === 'Checkbox' && formState && onFormChange) {
    const fieldId = (props.inputId || props.name || 'checkbox') as string;
    processed.checked = formState[fieldId] ?? props.checked ?? false;
    processed.onChange = ({ detail }: { detail: { checked: boolean } }) => {
      onFormChange(fieldId, detail.checked);
    };
  }

  // Toggle: Handle controlled state with onChange
  if (type === 'Toggle' && formState && onFormChange) {
    const fieldId = (props.inputId || props.name || 'toggle') as string;
    processed.checked = formState[fieldId] ?? props.checked ?? false;
    processed.onChange = ({ detail }: { detail: { checked: boolean } }) => {
      onFormChange(fieldId, detail.checked);
    };
  }

  // RadioGroup: Handle controlled state with onChange
  if (type === 'RadioGroup' && formState && onFormChange) {
    const fieldId = (props.inputId || props.name || 'radiogroup') as string;
    if (formState[fieldId] !== undefined) {
      processed.value = formState[fieldId];
    }
    processed.onChange = ({ detail }: { detail: { value: string } }) => {
      onFormChange(fieldId, detail.value);
    };
  }

  return processed;
}

/**
 * Render children recursively - can be string, array of components, or single component
 */
function renderChildren(
  children: unknown,
  onAction?: (actionId: string, params?: Record<string, unknown>) => void,
  formState?: Record<string, unknown>,
  onFormChange?: (fieldId: string, value: unknown) => void
): React.ReactNode {
  if (children === null || children === undefined) {
    return null;
  }

  // String children
  if (typeof children === 'string' || typeof children === 'number') {
    return children;
  }

  // Array of children
  if (Array.isArray(children)) {
    return children.map((child, index) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return <React.Fragment key={index}>{child}</React.Fragment>;
      }
      if (child && typeof child === 'object' && 'type' in child) {
        return (
          <DynamicRenderer
            key={index}
            component={child as DynamicComponent}
            onAction={onAction}
            formState={formState}
            onFormChange={onFormChange}
          />
        );
      }
      return null;
    });
  }

  // Single component object
  if (typeof children === 'object' && 'type' in children) {
    return (
      <DynamicRenderer
        component={children as DynamicComponent}
        onAction={onAction}
        formState={formState}
        onFormChange={onFormChange}
      />
    );
  }

  return null;
}

/**
 * DynamicRenderer - Renders Cloudscape components from JSON definitions
 *
 * Usage:
 * <DynamicRenderer
 *   component={{
 *     type: "Container",
 *     props: {
 *       header: "Title",
 *       children: [...]
 *     }
 *   }}
 *   onAction={(actionId, params) => handleAction(actionId, params)}
 *   onFormChange={(fieldId, value) => handleFormChange(fieldId, value)}
 * />
 */
export default function DynamicRenderer({
  component,
  onAction,
  onFormChange,
  formState: externalFormState,
}: DynamicComponentProps): React.ReactElement | null {
  const { type, props } = component;

  // Local form state for when no external state is provided
  const [localFormState, setLocalFormState] = useState<Record<string, unknown>>({});

  // Use external form state if provided, otherwise use local state
  const effectiveFormState = externalFormState ?? localFormState;

  // Handler that updates local state and notifies parent
  const handleFormChange = (fieldId: string, value: unknown) => {
    if (!externalFormState) {
      setLocalFormState(prev => ({ ...prev, [fieldId]: value }));
    }
    onFormChange?.(fieldId, value);
  };

  // Memoize component lookup
  const Component = useMemo(() => getComponent(type), [type]);

  if (!Component) {
    console.warn(`DynamicRenderer: Unknown component type "${type}"`);
    return null;
  }

  // Process props for special cases
  const processedProps = useMemo(
    () => processProps(type, props, onAction, effectiveFormState, handleFormChange),
    [type, props, onAction, effectiveFormState]
  );

  // Extract children from props
  const { children, ...restProps } = processedProps;

  // Handle header prop - can be a string or component
  let headerProp = restProps.header;
  if (headerProp && typeof headerProp === 'object' && 'type' in headerProp) {
    headerProp = (
      <DynamicRenderer
        component={headerProp as DynamicComponent}
        onAction={onAction}
        formState={effectiveFormState}
        onFormChange={handleFormChange}
      />
    );
  }

  // Handle footer prop - can be a string or component
  let footerProp = restProps.footer;
  if (footerProp && typeof footerProp === 'object' && 'type' in footerProp) {
    footerProp = (
      <DynamicRenderer
        component={footerProp as DynamicComponent}
        onAction={onAction}
        formState={effectiveFormState}
        onFormChange={handleFormChange}
      />
    );
  }

  // Handle action prop for containers/alerts
  let actionProp = restProps.action;
  if (actionProp && typeof actionProp === 'object' && 'type' in actionProp) {
    actionProp = (
      <DynamicRenderer
        component={actionProp as DynamicComponent}
        onAction={onAction}
        formState={effectiveFormState}
        onFormChange={handleFormChange}
      />
    );
  }

  // Build final props
  const finalProps = {
    ...restProps,
    ...(headerProp !== undefined && { header: headerProp }),
    ...(footerProp !== undefined && { footer: footerProp }),
    ...(actionProp !== undefined && { action: actionProp }),
  };

  // Render the component
  return (
    <Component {...finalProps}>
      {renderChildren(children, onAction, effectiveFormState, handleFormChange)}
    </Component>
  );
}

// Re-export types
export type { DynamicComponent, DynamicComponentProps } from './types';
