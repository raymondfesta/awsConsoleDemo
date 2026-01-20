import Box from '@cloudscape-design/components/box';
import { useChatContext } from '../../context/ChatContext';
import ConfigurationDisplay from '../ConfigurationDisplay';

export default function WorkflowDesignContent() {
  const { workflow } = useChatContext();

  const config = workflow.config;

  // Get the current step title for the header
  const getTitle = () => {
    if (workflow.view === 'review') {
      return 'Review and finish';
    }
    if (workflow.path === 'customize') {
      return 'DB Design - Customize';
    }
    if (workflow.path === 'auto-setup') {
      return 'DB Design - Auto setup';
    }
    return 'DB Design';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Step header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border-divider-default)',
      }}>
        <Box variant="h3" fontSize="heading-s">
          {getTitle()}
        </Box>
      </div>

      {/* Configuration content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px',
      }}>
        <ConfigurationDisplay
          title={config?.title || 'Configuration'}
          configSections={workflow.configSections}
        />
      </div>
    </div>
  );
}
