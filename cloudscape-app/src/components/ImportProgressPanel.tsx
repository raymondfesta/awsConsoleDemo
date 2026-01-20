import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Alert from '@cloudscape-design/components/alert';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import type { IndexRecommendation } from '../data/ecommerceSampleSchema';

export type ImportStatus = 'pending' | 'importing' | 'success' | 'error';

export interface TableImportStatus {
  name: string;
  displayName: string;
  recordCount: number;
  status: ImportStatus;
  importedCount?: number;
  error?: string;
}

interface ImportProgressPanelProps {
  tables: TableImportStatus[];
  overallProgress: number;
  estimatedTimeRemaining?: string;
  optimization?: IndexRecommendation;
  onApplyOptimization?: () => void;
  onSkipOptimization?: () => void;
  onComplete?: () => void;
  isComplete?: boolean;
  validationResults?: {
    recordsImported: number;
    tablesImported: number;
    relationshipsValid: boolean;
    errors?: string[];
  };
}

function getStatusIndicatorType(status: ImportStatus): 'pending' | 'in-progress' | 'success' | 'error' {
  if (status === 'importing') return 'in-progress';
  return status;
}

export default function ImportProgressPanel({
  tables,
  overallProgress,
  estimatedTimeRemaining,
  optimization,
  onApplyOptimization,
  onSkipOptimization,
  onComplete,
  isComplete = false,
  validationResults,
}: ImportProgressPanelProps) {
  const completedTables = tables.filter((t) => t.status === 'success').length;
  const totalRecordsImported = tables
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + t.recordCount, 0);

  return (
    <Container
      header={
        <Header
          variant="h2"
          description={
            isComplete
              ? 'All data has been imported and validated'
              : `Importing ${tables.length} tables...`
          }
          actions={
            isComplete && onComplete && (
              <Button variant="primary" onClick={onComplete}>
                Continue
              </Button>
            )
          }
        >
          {isComplete ? 'Import Complete' : 'Importing Data'}
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Overall progress */}
        <ProgressBar
          value={overallProgress}
          label="Overall progress"
          description={
            isComplete
              ? `${completedTables} tables imported successfully`
              : estimatedTimeRemaining
              ? `Estimated time remaining: ${estimatedTimeRemaining}`
              : undefined
          }
          variant={isComplete ? 'standalone' : 'flash'}
          status={isComplete ? 'success' : 'in-progress'}
        />

        {/* Table-by-table status */}
        <SpaceBetween size="xs">
          {tables.map((table) => (
            <div
              key={table.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: table.status === 'success' ? '#f2f8fd' : 'transparent',
                borderRadius: '4px',
              }}
            >
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <StatusIndicator type={getStatusIndicatorType(table.status)}>
                  {table.displayName}
                </StatusIndicator>
                {table.status === 'success' && (
                  <Box color="text-body-secondary" fontSize="body-s">
                    ({table.recordCount.toLocaleString()} records)
                  </Box>
                )}
                {table.status === 'importing' && table.importedCount !== undefined && (
                  <Box color="text-body-secondary" fontSize="body-s">
                    ({table.importedCount.toLocaleString()} / {table.recordCount.toLocaleString()})
                  </Box>
                )}
              </SpaceBetween>
              {table.error && (
                <Box color="text-status-error" fontSize="body-s">
                  {table.error}
                </Box>
              )}
            </div>
          ))}
        </SpaceBetween>

        {/* Optimization suggestion */}
        {optimization && !isComplete && (
          <Alert
            type="info"
            header="Optimization Opportunity"
            action={
              <SpaceBetween direction="horizontal" size="xs">
                {onApplyOptimization && (
                  <Button onClick={onApplyOptimization}>Apply index</Button>
                )}
                {onSkipOptimization && (
                  <Button variant="link" onClick={onSkipOptimization}>
                    Skip
                  </Button>
                )}
              </SpaceBetween>
            }
          >
            <SpaceBetween size="xs">
              <Box>
                {optimization.reason}
              </Box>
              <Box color="text-body-secondary" fontSize="body-s">
                Impact: {optimization.estimatedSpeedup} | Storage: {optimization.storageOverhead}
              </Box>
            </SpaceBetween>
          </Alert>
        )}

        {/* Validation results */}
        {isComplete && validationResults && (
          <Alert
            type={validationResults.errors?.length ? 'warning' : 'success'}
            header="Validation Results"
          >
            <SpaceBetween size="xs">
              <Box>
                <strong>{validationResults.recordsImported.toLocaleString()}</strong> records
                imported across <strong>{validationResults.tablesImported}</strong> tables
              </Box>
              {validationResults.relationshipsValid ? (
                <Box color="text-status-success">
                  All foreign key relationships valid
                </Box>
              ) : (
                <Box color="text-status-error">
                  Some relationship constraints failed
                </Box>
              )}
              {validationResults.errors && validationResults.errors.length > 0 && (
                <ExpandableSection headerText={`${validationResults.errors.length} warnings`}>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {validationResults.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </ExpandableSection>
              )}
            </SpaceBetween>
          </Alert>
        )}

        {/* Summary stats when complete */}
        {isComplete && (
          <Box textAlign="center" padding="l">
            <SpaceBetween size="xs" alignItems="center">
              <Box fontSize="display-l" fontWeight="bold" color="text-status-success">
                {totalRecordsImported.toLocaleString()}
              </Box>
              <Box color="text-body-secondary">records imported successfully</Box>
            </SpaceBetween>
          </Box>
        )}
      </SpaceBetween>
    </Container>
  );
}
