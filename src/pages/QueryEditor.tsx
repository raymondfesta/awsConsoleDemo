import { useNavigate } from 'react-router-dom';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Icon from '@cloudscape-design/components/icon';
import Select from '@cloudscape-design/components/select';
import { useState } from 'react';
import { useAppStore } from '../context/AppContext';

export default function QueryEditor() {
  const navigate = useNavigate();
  const { databases } = useAppStore();
  const [selectedDatabase, setSelectedDatabase] = useState<{ label: string; value: string } | null>(null);

  // Handle create database
  const handleCreateDatabase = () => {
    navigate('/create-database');
  };

  // No databases empty state
  if (databases.length === 0) {
    return (
      <ContentLayout
        defaultPadding
        header={
          <Header
            variant="h1"
            description="Write and execute SQL queries against your database clusters"
          >
            Query editor
          </Header>
        }
      >
        <Container>
          <Box textAlign="center" padding={{ vertical: 'xxxl' }}>
            <SpaceBetween size="m" alignItems="center">
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-background-status-info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon name="script" size="big" variant="link" />
              </div>
              <Box variant="h3" fontWeight="normal">
                No database to query
              </Box>
              <Box variant="p" color="text-body-secondary" padding={{ horizontal: 'xxxl' }}>
                Create a database cluster first to start writing and executing SQL queries.
              </Box>
              <Button variant="primary" onClick={handleCreateDatabase}>
                Create database
              </Button>
            </SpaceBetween>
          </Box>
        </Container>
      </ContentLayout>
    );
  }

  // Database options for select
  const databaseOptions = databases.map((db) => ({
    label: db.name,
    value: db.id,
    description: `${db.engine} - ${db.region}`,
  }));

  return (
    <ContentLayout
      defaultPadding
      header={
        <Header
          variant="h1"
          description="Write and execute SQL queries against your database clusters"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button>Save query</Button>
              <Button variant="primary" disabled={!selectedDatabase}>
                Run query
              </Button>
            </SpaceBetween>
          }
        >
          Query editor
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Database selector */}
        <Container>
          <SpaceBetween size="m">
            <Select
              selectedOption={selectedDatabase}
              onChange={({ detail }) => setSelectedDatabase(detail.selectedOption as { label: string; value: string })}
              options={databaseOptions}
              placeholder="Select a database cluster"
              filteringType="auto"
            />
          </SpaceBetween>
        </Container>

        {/* Query editor placeholder */}
        <Container
          header={<Header variant="h2">SQL Editor</Header>}
        >
          {selectedDatabase ? (
            <div style={{
              backgroundColor: 'var(--color-background-code-editor-default)',
              border: '1px solid var(--color-border-divider-default)',
              borderRadius: '4px',
              padding: '16px',
              minHeight: '200px',
              fontFamily: 'monospace',
              fontSize: '14px',
            }}>
              <Box color="text-body-secondary">
                -- Enter your SQL query here{'\n'}
                SELECT * FROM your_table LIMIT 10;
              </Box>
            </div>
          ) : (
            <Box textAlign="center" padding="l" color="text-body-secondary">
              <SpaceBetween size="xs" alignItems="center">
                <Icon name="status-info" />
                <Box>Select a database cluster to start querying</Box>
              </SpaceBetween>
            </Box>
          )}
        </Container>

        {/* Results placeholder */}
        <Container
          header={<Header variant="h2">Results</Header>}
        >
          <Box textAlign="center" padding="l" color="text-body-secondary">
            <SpaceBetween size="xs" alignItems="center">
              <Icon name="status-pending" />
              <Box>Run a query to see results</Box>
            </SpaceBetween>
          </Box>
        </Container>

        {/* Sample queries */}
        <Container
          header={<Header variant="h2">Sample queries</Header>}
        >
          <SpaceBetween size="m">
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--color-background-layout-main)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>
              <SpaceBetween size="xxs">
                <Box fontWeight="bold">List all tables</Box>
                <code style={{ fontSize: '12px', color: 'var(--color-text-body-secondary)' }}>
                  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
                </code>
              </SpaceBetween>
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--color-background-layout-main)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>
              <SpaceBetween size="xxs">
                <Box fontWeight="bold">Count records</Box>
                <code style={{ fontSize: '12px', color: 'var(--color-text-body-secondary)' }}>
                  SELECT COUNT(*) FROM your_table;
                </code>
              </SpaceBetween>
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--color-background-layout-main)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>
              <SpaceBetween size="xxs">
                <Box fontWeight="bold">Recent orders</Box>
                <code style={{ fontSize: '12px', color: 'var(--color-text-body-secondary)' }}>
                  SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
                </code>
              </SpaceBetween>
            </div>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
