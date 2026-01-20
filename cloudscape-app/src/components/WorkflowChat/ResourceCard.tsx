import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Icon from '@cloudscape-design/components/icon';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import type { ResourceInfo } from './types';

interface ResourceCardProps {
  resource: ResourceInfo;
  variant?: 'default' | 'compact';
  onClick?: () => void;
}

export default function ResourceCard({
  resource,
  variant = 'default',
  onClick,
}: ResourceCardProps) {
  const statusType = resource.status === 'active'
    ? 'success'
    : resource.status === 'creating'
      ? 'loading'
      : 'error';

  const statusLabel = resource.status === 'active'
    ? 'Active'
    : resource.status === 'creating'
      ? 'Creating...'
      : 'Error';

  if (variant === 'compact') {
    // Compact version for chat messages
    return (
      <div
        onClick={onClick}
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--color-background-container-content)',
          border: '1px solid var(--color-border-status-success)',
          borderRadius: '8px',
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Icon name="settings" size="medium" variant="success" />
        <div style={{ flex: 1 }}>
          <Box variant="strong">{resource.name}</Box>
          <Box color="text-body-secondary" fontSize="body-s">
            {resource.type} | {resource.region}
          </Box>
        </div>
        {onClick && <Icon name="angle-right" />}
      </div>
    );
  }

  // Default full card
  return (
    <Container>
      <SpaceBetween size="m">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--color-background-status-success)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon name="settings" size="medium" variant="success" />
          </div>

          <div style={{ flex: 1 }}>
            <SpaceBetween size="xxs">
              <Box variant="h3">{resource.name}</Box>
              <Box color="text-body-secondary">
                {resource.type}
              </Box>
              <Link href="#" fontSize="body-s">
                <Icon name="external" size="small" /> Learn more
              </Link>
            </SpaceBetween>
          </div>
        </div>

        {resource.details && Object.keys(resource.details).length > 0 && (
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Region</Box>
              <Box>{resource.region}</Box>
            </div>
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Status</Box>
              <StatusIndicator type={statusType}>{statusLabel}</StatusIndicator>
            </div>
            {resource.endpoint && (
              <div>
                <Box color="text-body-secondary" fontSize="body-s">Endpoint</Box>
                <code style={{ fontSize: '12px' }}>
                  {resource.endpoint}
                </code>
              </div>
            )}
            {Object.entries(resource.details).map(([key, value]) => (
              <div key={key}>
                <Box color="text-body-secondary" fontSize="body-s">{key}</Box>
                <Box>{value}</Box>
              </div>
            ))}
          </ColumnLayout>
        )}

        {!resource.details && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StatusIndicator type={statusType}>{statusLabel}</StatusIndicator>
            <Box color="text-body-secondary">|</Box>
            <Box color="text-body-secondary">{resource.region}</Box>
          </div>
        )}
      </SpaceBetween>
    </Container>
  );
}

// Multi-region cluster card variant
interface MultiRegionCardProps {
  resources: ResourceInfo[];
  title?: string;
}

export function MultiRegionCard({ resources, title = 'Multi-Region cluster' }: MultiRegionCardProps) {
  return (
    <Container header={<Box variant="h4">{title}</Box>}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(resources.length, 3)}, 1fr)`,
        gap: '16px',
      }}>
        {resources.map((resource) => (
          <div
            key={resource.id}
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-background-container-content)',
              border: '1px solid var(--color-border-divider-default)',
              borderRadius: '8px',
              position: 'relative',
            }}
          >
            {/* Connection line between regions */}
            {resources.length > 1 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '-8px',
                width: '16px',
                height: '2px',
                borderTop: '2px dashed var(--color-border-divider-default)',
              }} />
            )}

            <SpaceBetween size="xs">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="settings" size="small" variant="success" />
                <Box variant="strong">{resource.name}</Box>
              </div>
              <Box color="text-body-secondary" fontSize="body-s">
                {resource.type}
              </Box>
              <Link href="#" fontSize="body-s">
                <Icon name="external" size="small" /> Learn more
              </Link>
            </SpaceBetween>
          </div>
        ))}
      </div>
    </Container>
  );
}
