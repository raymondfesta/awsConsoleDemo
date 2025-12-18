import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../context/ChatContext';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Icon from '@cloudscape-design/components/icon';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Tabs from '@cloudscape-design/components/tabs';
import Button from '@cloudscape-design/components/button';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';

export default function DatabaseDetails() {
  const navigate = useNavigate();
  const { workflow, setDrawerOpen } = useChatContext();

  // If no resource, redirect to create database
  useEffect(() => {
    if (!workflow.resource) {
      navigate('/create-database');
    }
  }, [workflow.resource, navigate]);

  // Ensure drawer is open to show chat
  useEffect(() => {
    setDrawerOpen(true);
  }, [setDrawerOpen]);

  if (!workflow.resource) {
    return null;
  }

  const resource = workflow.resource;

  return (
    <div style={{ padding: '0' }}>
      <SpaceBetween size="l">
        {/* Header Card */}
        <div style={{
          backgroundColor: 'var(--color-background-container-content)',
          borderLeft: '4px solid var(--color-border-status-success)',
          borderRadius: '4px',
          padding: '16px 24px',
          boxShadow: '0 0 12px rgba(0, 128, 64, 0.15)',
        }}>
          <SpaceBetween size="xs">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon name="settings" variant="success" />
              <Box variant="h2" fontSize="heading-l">
                {resource.name}
              </Box>
            </div>
          </SpaceBetween>
        </div>

        {/* Cluster Overview */}
        <Container
          header={
            <Header
              variant="h2"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button>Edit</Button>
                  <Button variant="primary">Actions</Button>
                </SpaceBetween>
              }
            >
              Cluster overview
            </Header>
          }
        >
          <ColumnLayout columns={4} variant="text-grid">
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Tag: Name</Box>
              <Box>{resource.name.split(' - ')[0]}</Box>
            </div>
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Amazon Resource Name (ARN)</Box>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CopyToClipboard
                  copyButtonAriaLabel="Copy ARN"
                  copyErrorText="ARN failed to copy"
                  copySuccessText="ARN copied"
                  textToCopy={`arn:aws:dsql:${resource.region}:123456789:cluster/${resource.id}`}
                  variant="inline"
                />
              </div>
            </div>
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Status</Box>
              <StatusIndicator type={resource.status === 'active' ? 'success' : 'loading'}>
                {resource.status === 'active' ? 'Active' : 'Creating'}
              </StatusIndicator>
            </div>
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Public endpoint</Box>
              {resource.endpoint ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CopyToClipboard
                    copyButtonAriaLabel="Copy endpoint"
                    copyErrorText="Endpoint failed to copy"
                    copySuccessText="Endpoint copied"
                    textToCopy={resource.endpoint}
                    variant="inline"
                  />
                </div>
              ) : (
                <Box>-</Box>
              )}
            </div>
          </ColumnLayout>
        </Container>

        {/* Tabs */}
        <Tabs
          tabs={[
            {
              label: "Cluster settings",
              id: "settings",
              content: (
                <Container>
                  <ColumnLayout columns={4} variant="text-grid">
                    <div>
                      <Box color="text-body-secondary" fontSize="body-s">Cluster ID</Box>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CopyToClipboard
                          copyButtonAriaLabel="Copy cluster ID"
                          copyErrorText="ID failed to copy"
                          copySuccessText="ID copied"
                          textToCopy={resource.details?.['Cluster ID'] || resource.id}
                          variant="inline"
                        />
                      </div>
                    </div>
                    <div>
                      <Box color="text-body-secondary" fontSize="body-s">Engine</Box>
                      <Box>{resource.details?.['Engine'] || resource.type}</Box>
                    </div>
                    <div>
                      <Box color="text-body-secondary" fontSize="body-s">Deletion protection</Box>
                      <StatusIndicator type="success">Enabled</StatusIndicator>
                    </div>
                    <div>
                      <Box color="text-body-secondary" fontSize="body-s">Auto-scaling</Box>
                      <StatusIndicator type="success">
                        {resource.details?.['Auto-scaling'] || 'Enabled'}
                      </StatusIndicator>
                    </div>
                  </ColumnLayout>
                </Container>
              ),
            },
            {
              label: "Peers",
              id: "peers",
              content: (
                <Container>
                  <Box textAlign="center" color="text-body-secondary" padding="l">
                    No peer connections configured
                  </Box>
                </Container>
              ),
            },
            {
              label: "Permissions",
              id: "permissions",
              content: (
                <Container>
                  <Box textAlign="center" color="text-body-secondary" padding="l">
                    Default permissions applied
                  </Box>
                </Container>
              ),
            },
            {
              label: "Tags",
              id: "tags",
              content: (
                <Container>
                  <Box textAlign="center" color="text-body-secondary" padding="l">
                    No tags configured
                  </Box>
                </Container>
              ),
            },
          ]}
        />
      </SpaceBetween>
    </div>
  );
}
