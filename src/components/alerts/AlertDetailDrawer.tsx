import { useNavigate } from 'react-router-dom';
import Drawer from '@cloudscape-design/components/drawer';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Badge from '@cloudscape-design/components/badge';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import { type Alert, formatTimeAgo } from '../../data/alertsMockData';

interface AlertDetailDrawerProps {
  alert: Alert | null;
  visible: boolean;
  onDismiss: () => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export default function AlertDetailDrawer({
  alert,
  visible,
  onDismiss,
  onAcknowledge,
  onResolve,
}: AlertDetailDrawerProps) {
  const navigate = useNavigate();

  if (!alert) return null;

  const getSeverityType = (severity: Alert['severity']): 'error' | 'warning' | 'info' => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getStatusType = (status: Alert['status']): 'error' | 'warning' | 'success' | 'info' => {
    switch (status) {
      case 'active':
        return 'error';
      case 'acknowledged':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'info';
    }
  };

  const getSeverityBadgeColor = (severity: Alert['severity']): 'red' | 'grey' | 'blue' => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'grey';
      default:
        return 'blue';
    }
  };

  return (
    <Drawer
      header={
        <SpaceBetween size="xs">
          <Box variant="h2">{alert.name}</Box>
          <SpaceBetween direction="horizontal" size="xs">
            <Badge color={getSeverityBadgeColor(alert.severity)}>
              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
            </Badge>
            <StatusIndicator type={getStatusType(alert.status)}>
              {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
            </StatusIndicator>
          </SpaceBetween>
        </SpaceBetween>
      }
    >
      {visible && (
        <SpaceBetween size="l">
          {/* Alert Details */}
          <ColumnLayout columns={2} variant="text-grid">
            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                Description
              </Box>
              <Box>{alert.description}</Box>
            </SpaceBetween>

            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                Database
              </Box>
              <Box>{alert.database}</Box>
            </SpaceBetween>

            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                Triggered
              </Box>
              <Box>{formatTimeAgo(alert.triggeredAt)}</Box>
            </SpaceBetween>

            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                Severity
              </Box>
              <StatusIndicator type={getSeverityType(alert.severity)}>
                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
              </StatusIndicator>
            </SpaceBetween>

            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                Alert ID
              </Box>
              <Box fontWeight="light" color="text-body-secondary">
                {alert.id}
              </Box>
            </SpaceBetween>

            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                Timestamp
              </Box>
              <Box>{alert.triggeredAt.toLocaleString()}</Box>
            </SpaceBetween>
          </ColumnLayout>

          {/* Status Timeline */}
          <SpaceBetween size="xs">
            <Box variant="h3">Status Timeline</Box>
            <SpaceBetween size="xs">
              <Box>
                <StatusIndicator type="success">Created</StatusIndicator>
                <Box color="text-body-secondary" fontSize="body-s" padding={{ left: 'l' }}>
                  {alert.triggeredAt.toLocaleString()}
                </Box>
              </Box>
              {alert.status === 'acknowledged' && (
                <Box>
                  <StatusIndicator type="warning">Acknowledged</StatusIndicator>
                  <Box color="text-body-secondary" fontSize="body-s" padding={{ left: 'l' }}>
                    Status changed by user
                  </Box>
                </Box>
              )}
              {alert.status === 'resolved' && (
                <Box>
                  <StatusIndicator type="success">Resolved</StatusIndicator>
                  <Box color="text-body-secondary" fontSize="body-s" padding={{ left: 'l' }}>
                    Alert has been resolved
                  </Box>
                </Box>
              )}
            </SpaceBetween>
          </SpaceBetween>

          {/* Actions */}
          <SpaceBetween size="xs">
            <Box variant="h3">Actions</Box>
            <SpaceBetween direction="horizontal" size="xs">
              {alert.status === 'active' && (
                <Button onClick={() => onAcknowledge(alert.id)}>Acknowledge</Button>
              )}
              {(alert.status === 'active' || alert.status === 'acknowledged') && (
                <Button variant="primary" onClick={() => onResolve(alert.id)}>
                  Resolve
                </Button>
              )}
              <Button
                variant="link"
                onClick={() => {
                  onDismiss();
                  navigate(`/databases/${alert.databaseId}`);
                }}
              >
                View Database
              </Button>
            </SpaceBetween>
          </SpaceBetween>

          {/* Close button */}
          <Box float="right">
            <Button onClick={onDismiss}>Close</Button>
          </Box>
        </SpaceBetween>
      )}
    </Drawer>
  );
}
