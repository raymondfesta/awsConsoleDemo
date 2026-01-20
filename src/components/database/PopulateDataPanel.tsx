// Populate Data Panel Component
// Allows users to populate a database with sample data

import { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import DatasetSelector from '../DatasetSelector';
import type { DatasetType, PopulatedDatabase } from '../../data/sampleDatasets/types';
import { getDataset, getDatasetDefinition } from '../../data/sampleDatasets/registry';

interface PopulateDataPanelProps {
  databaseId: string;
  databaseName: string;
  isPopulated: boolean;
  currentDataset?: PopulatedDatabase;
  onPopulate: (datasetType: DatasetType) => void;
  onClear: () => void;
}

export default function PopulateDataPanel({
  databaseId: _databaseId,
  databaseName: _databaseName,
  isPopulated,
  currentDataset,
  onPopulate,
  onClear,
}: PopulateDataPanelProps) {
  const [selectedDataset, setSelectedDataset] = useState<DatasetType | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // Handle import with simulated progress
  const handleImport = async () => {
    if (!selectedDataset) return;

    setIsImporting(true);
    setImportProgress(0);

    // Simulate import progress
    const steps = [10, 25, 45, 65, 80, 95, 100];
    for (const progress of steps) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setImportProgress(progress);
    }

    // Complete the import
    onPopulate(selectedDataset);
    setIsImporting(false);
    setImportProgress(0);
    setSelectedDataset(null);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format number
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // If database is already populated, show current data info
  if (isPopulated && currentDataset) {
    const definition = getDatasetDefinition(currentDataset.datasetType);
    const dataset = getDataset(currentDataset.datasetType);

    return (
      <SpaceBetween size="l">
        <Alert type="success" header="Sample Data Loaded">
          This database is populated with the {definition?.name || currentDataset.datasetType} dataset.
          You can run queries in the Queries tab to explore the data.
        </Alert>

        <Container header={<Header variant="h3">Dataset Information</Header>}>
          <KeyValuePairs
            columns={4}
            items={[
              {
                label: 'Dataset',
                value: definition?.name || currentDataset.datasetType,
              },
              {
                label: 'Tables',
                value: currentDataset.tableCount.toString(),
              },
              {
                label: 'Total Records',
                value: formatNumber(currentDataset.recordCount),
              },
              {
                label: 'Imported',
                value: formatDate(currentDataset.importedAt),
              },
            ]}
          />
        </Container>

        {currentDataset.metrics.highlights && (
          <Container header={<Header variant="h3">Dataset Metrics</Header>}>
            <ColumnLayout columns={4} variant="text-grid">
              {currentDataset.metrics.highlights.map((highlight) => (
                <div key={highlight.id}>
                  <Box color="text-body-secondary" fontSize="body-s">
                    {highlight.label}
                  </Box>
                  <Box fontSize="heading-m" fontWeight="bold">
                    {highlight.format === 'currency'
                      ? `$${formatNumber(highlight.value as number)}`
                      : highlight.format === 'number'
                      ? formatNumber(highlight.value as number)
                      : highlight.value}
                  </Box>
                </div>
              ))}
            </ColumnLayout>
          </Container>
        )}

        {dataset?.schema.tables && (
          <Container header={<Header variant="h3">Tables</Header>}>
            <ColumnLayout columns={3} variant="text-grid">
              {dataset.schema.tables.map((table) => (
                <div key={table.name}>
                  <Box fontWeight="bold">{table.displayName}</Box>
                  <Box color="text-body-secondary" fontSize="body-s">
                    {formatNumber(table.recordCount)} records
                  </Box>
                </div>
              ))}
            </ColumnLayout>
          </Container>
        )}

        <Box>
          <Button onClick={onClear} variant="normal">
            Clear sample data
          </Button>
        </Box>
      </SpaceBetween>
    );
  }

  // Show import progress
  if (isImporting) {
    const dataset = selectedDataset ? getDataset(selectedDataset) : null;

    return (
      <Container header={<Header variant="h2">Importing Sample Data</Header>}>
        <SpaceBetween size="l">
          <Box textAlign="center">
            <StatusIndicator type="loading">
              Importing {dataset?.definition.name || 'dataset'}...
            </StatusIndicator>
          </Box>

          <ProgressBar
            value={importProgress}
            label="Import progress"
            description={
              importProgress < 30
                ? 'Creating tables...'
                : importProgress < 60
                ? 'Loading data...'
                : importProgress < 90
                ? 'Building indexes...'
                : 'Finalizing...'
            }
          />
        </SpaceBetween>
      </Container>
    );
  }

  // Show dataset selection
  return (
    <SpaceBetween size="l">
      <Alert type="info">
        Populate this database with sample data to explore queries and see realistic results.
        All data is simulated and stored locally.
      </Alert>

      <Container header={<Header variant="h2">Select a Sample Dataset</Header>}>
        <SpaceBetween size="l">
          <DatasetSelector
            selectedDataset={selectedDataset}
            onSelect={setSelectedDataset}
            mode="cards"
          />

          {selectedDataset && (
            <DatasetPreview datasetType={selectedDataset} />
          )}

          <Box>
            <Button
              variant="primary"
              disabled={!selectedDataset}
              onClick={handleImport}
            >
              Import {selectedDataset ? getDatasetDefinition(selectedDataset)?.name : 'Dataset'}
            </Button>
          </Box>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
}

// Dataset Preview Component
function DatasetPreview({ datasetType }: { datasetType: DatasetType }) {
  const dataset = getDataset(datasetType);
  if (!dataset) return null;

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <Container header={<Header variant="h3">Preview: {dataset.definition.name}</Header>}>
      <SpaceBetween size="m">
        <Box color="text-body-secondary">{dataset.definition.description}</Box>

        <ColumnLayout columns={4} variant="text-grid">
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Tables</Box>
            <Box fontSize="heading-s" fontWeight="bold">{dataset.schema.tables.length}</Box>
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Total Records</Box>
            <Box fontSize="heading-s" fontWeight="bold">{formatNumber(dataset.schema.totalRecords)}</Box>
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Sample Queries</Box>
            <Box fontSize="heading-s" fontWeight="bold">{dataset.suggestedQueries.length}</Box>
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Date Range</Box>
            <Box fontSize="heading-s" fontWeight="bold">
              {dataset.metrics.dateRange.start.slice(0, 7)} - {dataset.metrics.dateRange.end.slice(0, 7)}
            </Box>
          </div>
        </ColumnLayout>

        <Box>
          <Box color="text-body-secondary" fontSize="body-s" margin={{ bottom: 'xs' }}>Tables included:</Box>
          <SpaceBetween direction="horizontal" size="xs">
            {dataset.schema.tables.slice(0, 5).map((table) => (
              <Box key={table.name} padding={{ horizontal: 's', vertical: 'xxs' }}
                   display="inline-block" fontSize="body-s">
                {table.displayName} ({formatNumber(table.recordCount)})
              </Box>
            ))}
            {dataset.schema.tables.length > 5 && (
              <Box padding={{ horizontal: 's', vertical: 'xxs' }} color="text-body-secondary" fontSize="body-s">
                +{dataset.schema.tables.length - 5} more
              </Box>
            )}
          </SpaceBetween>
        </Box>
      </SpaceBetween>
    </Container>
  );
}
