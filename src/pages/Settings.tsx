import ContentLayout from '@cloudscape-design/components/content-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import FormField from '@cloudscape-design/components/form-field';
import Toggle from '@cloudscape-design/components/toggle';
import Box from '@cloudscape-design/components/box';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Alert from '@cloudscape-design/components/alert';
import { useState } from 'react';
import { useAppStore } from '../context/AppContext';

export default function Settings() {
  const { theme, toggleTheme, databases, clearActivities } = useAppStore();
  const [selectedRegion, setSelectedRegion] = useState({ label: 'US East (N. Virginia)', value: 'us-east-1' });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const regionOptions = [
    { label: 'US East (N. Virginia)', value: 'us-east-1' },
    { label: 'US East (Ohio)', value: 'us-east-2' },
    { label: 'US West (Oregon)', value: 'us-west-2' },
    { label: 'EU (Ireland)', value: 'eu-west-1' },
    { label: 'EU (Frankfurt)', value: 'eu-central-1' },
    { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
    { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
  ];

  return (
    <ContentLayout
      defaultPadding
      header={
        <Header
          variant="h1"
          description="Configure your Aurora DSQL console preferences"
        >
          Settings
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Appearance */}
        <Container header={<Header variant="h2">Appearance</Header>}>
          <SpaceBetween size="l">
            <FormField
              label="Color theme"
              description="Choose between light and dark visual mode"
            >
              <Toggle
                checked={theme === 'dark'}
                onChange={toggleTheme}
              >
                Dark mode {theme === 'dark' ? 'enabled' : 'disabled'}
              </Toggle>
            </FormField>
          </SpaceBetween>
        </Container>

        {/* Default settings */}
        <Container header={<Header variant="h2">Default settings</Header>}>
          <SpaceBetween size="l">
            <FormField
              label="Default region"
              description="The default AWS region for new database clusters"
            >
              <Select
                selectedOption={selectedRegion}
                onChange={({ detail }) => setSelectedRegion(detail.selectedOption as { label: string; value: string })}
                options={regionOptions}
              />
            </FormField>
            <FormField
              label="Notifications"
              description="Receive in-app notifications for important events"
            >
              <Toggle
                checked={notificationsEnabled}
                onChange={({ detail }) => setNotificationsEnabled(detail.checked)}
              >
                Notifications {notificationsEnabled ? 'enabled' : 'disabled'}
              </Toggle>
            </FormField>
            <FormField
              label="Auto-refresh"
              description="Automatically refresh dashboard data every 30 seconds"
            >
              <Toggle
                checked={autoRefresh}
                onChange={({ detail }) => setAutoRefresh(detail.checked)}
              >
                Auto-refresh {autoRefresh ? 'enabled' : 'disabled'}
              </Toggle>
            </FormField>
          </SpaceBetween>
        </Container>

        {/* Data management */}
        <Container header={<Header variant="h2">Data management</Header>}>
          <SpaceBetween size="l">
            <Alert type="warning">
              These actions cannot be undone. Please proceed with caution.
            </Alert>
            <ColumnLayout columns={2}>
              <FormField
                label="Clear activity history"
                description="Remove all activity events from the dashboard"
              >
                <Button onClick={clearActivities}>Clear history</Button>
              </FormField>
              <FormField
                label="Reset preferences"
                description="Reset all settings to their default values"
              >
                <Button>Reset to defaults</Button>
              </FormField>
            </ColumnLayout>
          </SpaceBetween>
        </Container>

        {/* Account information */}
        <Container header={<Header variant="h2">Account information</Header>}>
          <ColumnLayout columns={3} variant="text-grid">
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Account ID</Box>
              <Box>123456789012</Box>
            </div>
            <div>
              <Box color="text-body-secondary" fontSize="body-s">IAM user</Box>
              <Box>admin</Box>
            </div>
            <div>
              <Box color="text-body-secondary" fontSize="body-s">ARN</Box>
              <Box fontSize="body-s">arn:aws:iam::123456789012:user/admin</Box>
            </div>
          </ColumnLayout>
        </Container>

        {/* About */}
        <Container header={<Header variant="h2">About</Header>}>
          <ColumnLayout columns={3} variant="text-grid">
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Application</Box>
              <Box>Aurora DSQL Console</Box>
            </div>
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Version</Box>
              <Box>1.0.0 (Demo)</Box>
            </div>
            <div>
              <Box color="text-body-secondary" fontSize="body-s">Database clusters</Box>
              <Box>{databases.length}</Box>
            </div>
          </ColumnLayout>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
