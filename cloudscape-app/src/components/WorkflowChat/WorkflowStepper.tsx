import Steps from '@cloudscape-design/components/steps';
import { useWorkflow } from './WorkflowContext';
import type { StepStatus } from './types';

// Map our status to Cloudscape Steps status
function mapStatus(status: StepStatus): 'pending' | 'loading' | 'success' | 'error' {
  switch (status) {
    case 'in-progress':
      return 'loading';
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    default:
      return 'pending';
  }
}

interface WorkflowStepperProps {
  className?: string;
}

export default function WorkflowStepper({ className }: WorkflowStepperProps) {
  const { state } = useWorkflow();

  const stepsItems = state.steps.map((step) => ({
    header: step.title,
    status: mapStatus(step.status),
    statusIconAriaLabel: `${step.title} ${step.status}`,
  }));

  return (
    <div className={className}>
      <Steps
        steps={stepsItems}
      />
    </div>
  );
}
