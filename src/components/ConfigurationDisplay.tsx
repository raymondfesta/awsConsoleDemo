import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import type { ConfigurationState, StepStatus } from '../context/ChatContext';

interface ConfigurationDisplayProps {
  title: string;
  configSections: ConfigurationState;
}

function getStatusIndicatorType(status: StepStatus): 'pending' | 'in-progress' | 'success' | 'error' {
  return status;
}

function getStatusLabel(status: StepStatus, sectionTitle: string): string {
  switch (status) {
    case 'success':
      return `${sectionTitle} complete`;
    case 'in-progress':
      return 'Customization in progress';
    case 'error':
      return 'Error';
    default:
      return 'Pending';
  }
}

interface ConfigSectionProps {
  title: string;
  status: StepStatus;
  values: Record<string, string>;
}

function ConfigSection({ title, status, values }: ConfigSectionProps) {
  const hasValues = Object.keys(values).length > 0;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <Box variant="h3" fontSize="heading-s" fontWeight="bold">
          {title.toUpperCase()}
        </Box>
        <StatusIndicator type={getStatusIndicatorType(status)}>
          {getStatusLabel(status, title)}
        </StatusIndicator>
      </div>

      {hasValues ? (
        <Container>
          <ColumnLayout columns={3} variant="text-grid">
            {Object.entries(values).map(([key, value]) => (
              <div key={key}>
                <Box color="text-body-secondary" fontSize="body-s">
                  {key}
                </Box>
                <Box>{value}</Box>
              </div>
            ))}
          </ColumnLayout>
        </Container>
      ) : (
        <Container>
          <Box color="text-body-secondary" textAlign="center" padding="s">
            Configuration pending...
          </Box>
        </Container>
      )}
    </div>
  );
}

export default function ConfigurationDisplay({
  title,
  configSections,
}: ConfigurationDisplayProps) {
  return (
    <div style={{ flex: 1 }}>
      <SpaceBetween size="l">
        <Box variant="h1" fontSize="heading-l" fontWeight="bold">
          {title}
        </Box>

        <div>
          <ConfigSection
            title={configSections.cluster.title}
            status={configSections.cluster.status}
            values={configSections.cluster.values}
          />

          <ConfigSection
            title={configSections.instance.title}
            status={configSections.instance.status}
            values={configSections.instance.values}
          />

          <ConfigSection
            title={configSections.storage.title}
            status={configSections.storage.status}
            values={configSections.storage.values}
          />

          <ConfigSection
            title={configSections.security.title}
            status={configSections.security.status}
            values={configSections.security.values}
          />
        </div>
      </SpaceBetween>
    </div>
  );
}
