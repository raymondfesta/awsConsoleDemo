import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../context/ChatContext';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Tabs from '@cloudscape-design/components/tabs';
import Button from '@cloudscape-design/components/button';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import Alert from '@cloudscape-design/components/alert';

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
  const configSections = workflow.configSections;

  return (
    <div style={{ padding: '0' }}>
      <SpaceBetween size="l">
        {/* Header */}
        <Header
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button>Edit</Button>
              <Button>Delete</Button>
              <Button variant="primary">Actions</Button>
            </SpaceBetween>
          }
        >
          {resource.name.split(' - ')[0]}
        </Header>

        {/* Setup continuation alert */}
        <Alert
          type="info"
          header="Continue setting up your database"
          action={
            <Button onClick={() => navigate('/import-data')}>
              Import data
            </Button>
          }
        >
          Your database cluster is ready. Import your data to start building your application.
        </Alert>

        {/* Cluster Overview */}
        <Container
          header={<Header variant="h2">Cluster overview</Header>}
        >
          <ColumnLayout columns={4} variant="text-grid">
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Status</Box>
              <StatusIndicator type={resource.status === 'active' ? 'success' : 'loading'}>
                {resource.status === 'active' ? 'Active' : 'Creating'}
              </StatusIndicator>
            </div>
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Engine</Box>
              <Box>{configSections.cluster.values['Engine'] || resource.type}</Box>
            </div>
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Region</Box>
              <Box>{configSections.cluster.values['Region'] || resource.region}</Box>
            </div>
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Endpoint</Box>
              {resource.endpoint ? (
                <CopyToClipboard
                  copyButtonAriaLabel="Copy endpoint"
                  copyErrorText="Endpoint failed to copy"
                  copySuccessText="Endpoint copied"
                  textToCopy={resource.endpoint}
                  variant="inline"
                />
              ) : (
                <Box>-</Box>
              )}
            </div>
          </ColumnLayout>
        </Container>

        {/* Tabs with Configuration Details */}
        <Tabs
          tabs={[
            {
              label: "Configuration",
              id: "configuration",
              content: (
                <SpaceBetween size="l">
                  {/* Cluster Configuration */}
                  <Container header={<Header variant="h3">Cluster configuration</Header>}>
                    <ColumnLayout columns={3} variant="text-grid">
                      {Object.entries(configSections.cluster.values).map(([key, value]) => (
                        <div key={key}>
                          <Box color="text-body-secondary" fontSize="body-s">{key}</Box>
                          <Box>{value}</Box>
                        </div>
                      ))}
                      <div>
                        <Box color="text-body-secondary" fontSize="body-s">Cluster ID</Box>
                        <CopyToClipboard
                          copyButtonAriaLabel="Copy cluster ID"
                          copyErrorText="ID failed to copy"
                          copySuccessText="ID copied"
                          textToCopy={resource.details?.['Cluster ID'] || resource.id}
                          variant="inline"
                        />
                      </div>
                      <div>
                        <Box color="text-body-secondary" fontSize="body-s">ARN</Box>
                        <CopyToClipboard
                          copyButtonAriaLabel="Copy ARN"
                          copyErrorText="ARN failed to copy"
                          copySuccessText="ARN copied"
                          textToCopy={`arn:aws:dsql:${resource.region}:123456789:cluster/${resource.id}`}
                          variant="inline"
                        />
                      </div>
                    </ColumnLayout>
                  </Container>

                  {/* Instance Configuration */}
                  <Container header={<Header variant="h3">Instance</Header>}>
                    <ColumnLayout columns={4} variant="text-grid">
                      {Object.entries(configSections.instance.values).map(([key, value]) => (
                        <div key={key}>
                          <Box color="text-body-secondary" fontSize="body-s">{key}</Box>
                          <Box>{value}</Box>
                        </div>
                      ))}
                    </ColumnLayout>
                  </Container>

                  {/* Storage & Performance */}
                  <Container header={<Header variant="h3">Storage & Performance</Header>}>
                    <ColumnLayout columns={3} variant="text-grid">
                      {Object.entries(configSections.storage.values).map(([key, value]) => (
                        <div key={key}>
                          <Box color="text-body-secondary" fontSize="body-s">{key}</Box>
                          <Box>{value}</Box>
                        </div>
                      ))}
                    </ColumnLayout>
                  </Container>

                  {/* Security */}
                  <Container header={<Header variant="h3">Security</Header>}>
                    <ColumnLayout columns={4} variant="text-grid">
                      {Object.entries(configSections.security.values).map(([key, value]) => (
                        <div key={key}>
                          <Box color="text-body-secondary" fontSize="body-s">{key}</Box>
                          <Box>{value}</Box>
                        </div>
                      ))}
                    </ColumnLayout>
                  </Container>
                </SpaceBetween>
              ),
            },
            {
              label: "Connectivity",
              id: "connectivity",
              content: (
                <Container>
                  <ColumnLayout columns={2} variant="text-grid">
                    <div>
                      <Box color="text-body-secondary" fontSize="body-s">Public endpoint</Box>
                      {resource.endpoint ? (
                        <CopyToClipboard
                          copyButtonAriaLabel="Copy endpoint"
                          copyErrorText="Endpoint failed to copy"
                          copySuccessText="Endpoint copied"
                          textToCopy={resource.endpoint}
                          variant="inline"
                        />
                      ) : (
                        <Box>-</Box>
                      )}
                    </div>
                    <div>
                      <Box color="text-body-secondary" fontSize="body-s">Port</Box>
                      <Box>5432</Box>
                    </div>
                    <div>
                      <Box color="text-body-secondary" fontSize="body-s">VPC</Box>
                      <Box>{configSections.security.values['VPC'] || 'Default VPC'}</Box>
                    </div>
                    <div>
                      <Box color="text-body-secondary" fontSize="body-s">Public access</Box>
                      <StatusIndicator type="stopped">
                        {configSections.security.values['Public access'] || 'Disabled'}
                      </StatusIndicator>
                    </div>
                  </ColumnLayout>
                </Container>
              ),
            },
            {
              label: "Monitoring",
              id: "monitoring",
              content: (
                <Container>
                  <Box textAlign="center" color="text-body-secondary" padding="l">
                    Monitoring data will appear here once the database has been running for a few minutes.
                  </Box>
                </Container>
              ),
            },
            {
              label: "Tags",
              id: "tags",
              content: (
                <Container>
                  <ColumnLayout columns={2} variant="text-grid">
                    <div>
                      <Box color="text-body-secondary" fontSize="body-s">Environment</Box>
                      <Box>Production</Box>
                    </div>
                    <div>
                      <Box color="text-body-secondary" fontSize="body-s">Application</Box>
                      <Box>Food Delivery</Box>
                    </div>
                  </ColumnLayout>
                </Container>
              ),
            },
          ]}
        />
      </SpaceBetween>
    </div>
  );
}
