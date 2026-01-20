import { useState, useMemo, useCallback } from 'react';
import Grid from '@cloudscape-design/components/grid';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Tabs from '@cloudscape-design/components/tabs';
import Textarea from '@cloudscape-design/components/textarea';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Table from '@cloudscape-design/components/table';
import Badge from '@cloudscape-design/components/badge';
import FormField from '@cloudscape-design/components/form-field';
import Alert from '@cloudscape-design/components/alert';
import SchemaOverview, { MOCK_SCHEMA_TABLES, type SchemaTable } from './SchemaOverview';
import { useAppStore } from '../../context/AppContext';
import { getDataset } from '../../data/sampleDatasets/registry';
import {
  getSuggestedQueries,
  executeNaturalLanguageQuery,
  executeSQLQuery,
  generateSQLFromNaturalLanguage,
  formatExecutionTime,
  createHistoryItem,
  type QueryResult,
  type QueryHistoryItem,
} from '../../services/querySimulator';

// Default suggested queries for non-populated databases
const DEFAULT_SUGGESTED_QUERIES = [
  'Get orders above $50 last week',
  'Find users who signed up this month',
  'Show top selling products',
  'Count daily active users',
];

interface QueriesTabProps {
  databaseName: string;
  tables?: SchemaTable[];
}

export default function QueriesTab({ databaseName, tables }: QueriesTabProps) {
  const [textQuery, setTextQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [activeQueryTab, setActiveQueryTab] = useState('text');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [generatedSQL, setGeneratedSQL] = useState<{ sql: string; explanation: string } | null>(null);

  // Get populated database state
  const { populatedDatabases } = useAppStore();
  const populatedData = populatedDatabases[databaseName];
  const isPopulated = !!populatedData;
  const datasetType = populatedData?.datasetType;

  // Format record count for display
  const formatRowCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(3)}M rows`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K rows`;
    }
    return `${count} rows`;
  };

  // Get schema tables - either from props, dataset, or default mock
  const schemaTables = useMemo(() => {
    if (tables) return tables;
    if (datasetType) {
      const dataset = getDataset(datasetType);
      if (dataset) {
        return dataset.schema.tables.map(t => ({
          name: t.name,
          displayName: t.displayName,
          columns: t.columns.map(c => ({
            name: c.name,
            type: c.type,
            reference: c.foreignKey || '-',
          })),
          rowCount: formatRowCount(t.recordCount),
        }));
      }
    }
    return MOCK_SCHEMA_TABLES;
  }, [tables, datasetType]);

  // Get suggested queries based on dataset
  const suggestedQueries = useMemo(() => {
    if (datasetType) {
      return getSuggestedQueries(datasetType).slice(0, 4).map(q => q.naturalLanguage);
    }
    return DEFAULT_SUGGESTED_QUERIES;
  }, [datasetType]);

  // Handle text query analysis (generate SQL)
  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setQueryResult(null);

    // Simulate AI processing delay
    setTimeout(() => {
      if (datasetType) {
        const result = generateSQLFromNaturalLanguage(datasetType, textQuery);
        setGeneratedSQL(result);
      } else {
        // Fallback for non-populated databases
        setGeneratedSQL({
          sql: `-- Generated SQL for: "${textQuery}"
SELECT o.order_id, o.total_amount, o.created_at, u.first_name, u.last_name
FROM orders o
JOIN users u ON o.user_id = u.user_id
WHERE o.total_amount > 50
  AND o.created_at > NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC
LIMIT 100;`,
          explanation: 'Retrieves orders above $50 from the last 7 days with customer details.',
        });
      }
      setIsAnalyzing(false);
    }, 800);
  }, [textQuery, datasetType]);

  // Handle running the generated SQL
  const handleRunGenerated = useCallback(() => {
    if (!generatedSQL) return;

    setIsExecuting(true);

    setTimeout(() => {
      if (datasetType) {
        const result = executeNaturalLanguageQuery(datasetType, textQuery);
        setQueryResult(result);

        // Add to history
        const historyItem = createHistoryItem(result, datasetType);
        setQueryHistory(prev => [historyItem, ...prev].slice(0, 20));
      } else {
        // Mock result for non-populated database
        setQueryResult({
          success: true,
          query: textQuery,
          sql: generatedSQL.sql,
          executionTime: Math.floor(Math.random() * 300) + 50,
          rowCount: 0,
          columns: [],
          data: [],
          error: 'No data available. Populate this database with sample data in the Data tab to see query results.',
        });
      }
      setIsExecuting(false);
    }, 500);
  }, [generatedSQL, textQuery, datasetType]);

  // Handle direct SQL execution
  const handleExecute = useCallback(() => {
    setIsExecuting(true);
    setQueryResult(null);

    setTimeout(() => {
      if (datasetType) {
        const result = executeSQLQuery(datasetType, sqlQuery);
        setQueryResult(result);

        // Add to history
        const historyItem = createHistoryItem(result, datasetType);
        setQueryHistory(prev => [historyItem, ...prev].slice(0, 20));
      } else {
        // Mock result for non-populated database
        setQueryResult({
          success: true,
          query: 'Custom SQL Query',
          sql: sqlQuery,
          executionTime: Math.floor(Math.random() * 300) + 50,
          rowCount: 0,
          columns: [],
          data: [],
          error: 'No data available. Populate this database with sample data in the Data tab to see query results.',
        });
      }
      setIsExecuting(false);
    }, 500);
  }, [sqlQuery, datasetType]);

  // Handle suggested query click
  const handleSuggestedQuery = (query: string) => {
    setTextQuery(query);
    setGeneratedSQL(null);
    setQueryResult(null);
  };

  // Handle history re-run
  const handleRerunHistory = useCallback((item: QueryHistoryItem) => {
    setSqlQuery(item.sql);
    setActiveQueryTab('sql');
  }, []);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const ms = Date.now() - date.getTime();
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Render query results table
  const renderResultsTable = () => {
    if (!queryResult) return null;

    if (!queryResult.success && queryResult.error) {
      return (
        <Alert type="error" header="Query Error">
          {queryResult.error}
        </Alert>
      );
    }

    if (queryResult.data.length === 0) {
      if (queryResult.error) {
        return (
          <Alert type="info">
            {queryResult.error}
          </Alert>
        );
      }
      return (
        <Box textAlign="center" color="text-body-secondary" padding="l">
          Query executed successfully but returned no results.
        </Box>
      );
    }

    return (
      <Table
        items={queryResult.data as Record<string, unknown>[]}
        columnDefinitions={queryResult.columns.map(col => ({
          id: col.key,
          header: col.label,
          cell: (item: Record<string, unknown>) => {
            const value = item[col.key];
            if (value === null || value === undefined) return '-';
            if (col.type === 'currency') return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            if (col.type === 'number') return Number(value).toLocaleString();
            if (col.type === 'percentage') return `${value}%`;
            if (col.type === 'date' && typeof value === 'string') {
              return new Date(value).toLocaleDateString();
            }
            return String(value);
          },
        }))}
        variant="embedded"
        stripedRows
        wrapLines
      />
    );
  };

  return (
    <Grid
      gridDefinition={[
        { colspan: { default: 12, s: 5 } },
        { colspan: { default: 12, s: 7 } },
      ]}
    >
      {/* Schema Overview */}
      <SchemaOverview tables={schemaTables} />

      {/* Query Interface */}
      <Container>
        {!isPopulated && (
          <Alert type="info" dismissible>
            Populate this database with sample data in the <strong>Data</strong> tab to run queries with realistic results.
          </Alert>
        )}

        <Tabs
          activeTabId={activeQueryTab}
          onChange={({ detail }) => setActiveQueryTab(detail.activeTabId)}
          tabs={[
            {
              id: 'text',
              label: 'Text query',
              content: (
                <SpaceBetween size="m">
                  <FormField label="Query 1">
                    <Textarea
                      value={textQuery}
                      onChange={({ detail }) => {
                        setTextQuery(detail.value);
                        setGeneratedSQL(null);
                        setQueryResult(null);
                      }}
                      placeholder="Get orders above $50 last week"
                      rows={3}
                    />
                  </FormField>

                  {/* Suggested queries */}
                  {!textQuery && (
                    <Box>
                      <Box color="text-body-secondary" fontSize="body-s" padding={{ bottom: 'xs' }}>
                        Suggested queries:
                      </Box>
                      <SpaceBetween direction="horizontal" size="xs">
                        {suggestedQueries.map((query, index) => (
                          <Button
                            key={index}
                            variant="inline-link"
                            onClick={() => handleSuggestedQuery(query)}
                          >
                            {query}
                          </Button>
                        ))}
                      </SpaceBetween>
                    </Box>
                  )}

                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      variant="primary"
                      onClick={handleAnalyze}
                      disabled={!textQuery.trim()}
                      loading={isAnalyzing}
                      iconName="gen-ai"
                    >
                      Analyze
                    </Button>
                    <Button
                      iconName="refresh"
                      variant="icon"
                      ariaLabel="Reset"
                      onClick={() => {
                        setTextQuery('');
                        setGeneratedSQL(null);
                        setQueryResult(null);
                      }}
                    />
                    {generatedSQL && (
                      <Button
                        iconName="caret-right-filled"
                        variant="primary"
                        onClick={handleRunGenerated}
                        loading={isExecuting}
                      >
                        Run
                      </Button>
                    )}
                  </SpaceBetween>

                  {/* Generated SQL result */}
                  {generatedSQL && (
                    <Container
                      header={
                        <Header variant="h3" actions={<Button iconName="copy">Copy SQL</Button>}>
                          Generated SQL
                        </Header>
                      }
                    >
                      <SpaceBetween size="s">
                        <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{generatedSQL.sql}</pre>
                        </div>
                        <Box color="text-body-secondary" fontSize="body-s">
                          {generatedSQL.explanation}
                        </Box>
                      </SpaceBetween>
                    </Container>
                  )}

                  {/* Query results */}
                  {queryResult && (
                    <Container
                      header={
                        <Header
                          variant="h3"
                          description={
                            queryResult.success
                              ? `${queryResult.rowCount.toLocaleString()} rows • ${formatExecutionTime(queryResult.executionTime)}`
                              : undefined
                          }
                        >
                          Results
                        </Header>
                      }
                    >
                      {renderResultsTable()}
                    </Container>
                  )}
                </SpaceBetween>
              ),
            },
            {
              id: 'sql',
              label: 'SQL query',
              content: (
                <SpaceBetween size="m">
                  <FormField label="SQL Query">
                    <Textarea
                      value={sqlQuery}
                      onChange={({ detail }) => {
                        setSqlQuery(detail.value);
                        setQueryResult(null);
                      }}
                      placeholder="SELECT * FROM orders WHERE total_amount > 50 LIMIT 10;"
                      rows={6}
                    />
                  </FormField>

                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      variant="primary"
                      onClick={handleExecute}
                      disabled={!sqlQuery.trim()}
                      loading={isExecuting}
                      iconName="caret-right-filled"
                    >
                      Execute
                    </Button>
                    <Button iconName="copy" variant="normal">
                      Format
                    </Button>
                    <Button
                      iconName="refresh"
                      variant="icon"
                      ariaLabel="Reset"
                      onClick={() => {
                        setSqlQuery('');
                        setQueryResult(null);
                      }}
                    />
                  </SpaceBetween>

                  {/* Query results */}
                  {queryResult && (
                    <Container
                      header={
                        <Header
                          variant="h3"
                          description={
                            queryResult.success
                              ? `${queryResult.rowCount.toLocaleString()} rows • ${formatExecutionTime(queryResult.executionTime)}`
                              : undefined
                          }
                        >
                          Results
                        </Header>
                      }
                    >
                      {renderResultsTable()}
                    </Container>
                  )}
                </SpaceBetween>
              ),
            },
            {
              id: 'history',
              label: 'Query history',
              content: (
                <Table
                  items={queryHistory}
                  columnDefinitions={[
                    {
                      id: 'query',
                      header: 'Query',
                      cell: (item) => (
                        <SpaceBetween size="xxs">
                          <Box fontWeight="bold">{item.query}</Box>
                          <div style={{ color: '#5f6b7a', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                            {item.sql.substring(0, 50)}...
                          </div>
                        </SpaceBetween>
                      ),
                    },
                    {
                      id: 'status',
                      header: 'Status',
                      cell: (item) => (
                        <Badge color={item.status === 'success' ? 'green' : 'red'}>
                          {item.status}
                        </Badge>
                      ),
                      width: 100,
                    },
                    {
                      id: 'rows',
                      header: 'Rows',
                      cell: (item) => item.rowsReturned.toLocaleString(),
                      width: 80,
                    },
                    {
                      id: 'execTime',
                      header: 'Time',
                      cell: (item) => formatExecutionTime(item.executionTime),
                      width: 80,
                    },
                    {
                      id: 'when',
                      header: 'When',
                      cell: (item) => formatTimeAgo(item.executedAt),
                      width: 100,
                    },
                    {
                      id: 'actions',
                      header: '',
                      cell: (item) => (
                        <SpaceBetween direction="horizontal" size="xxs">
                          <Button variant="inline-icon" iconName="copy" ariaLabel="Copy" />
                          <Button
                            variant="inline-icon"
                            iconName="refresh"
                            ariaLabel="Re-run"
                            onClick={() => handleRerunHistory(item)}
                          />
                        </SpaceBetween>
                      ),
                      width: 80,
                    },
                  ]}
                  variant="embedded"
                  stripedRows
                  empty={
                    <Box textAlign="center" color="text-body-secondary" padding="l">
                      No query history yet. Run some queries to see them here.
                    </Box>
                  }
                />
              ),
            },
          ]}
        />
      </Container>
    </Grid>
  );
}
