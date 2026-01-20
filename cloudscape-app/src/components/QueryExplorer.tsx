import { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Tiles from '@cloudscape-design/components/tiles';
import Table from '@cloudscape-design/components/table';
import PromptInput from '@cloudscape-design/components/prompt-input';
import Badge from '@cloudscape-design/components/badge';
import BarChart from '@cloudscape-design/components/bar-chart';
import { SupportPromptGroup } from '@cloudscape-design/chat-components';
import CodeView from './DynamicRenderer/CodeView';
import {
  SUGGESTED_QUERIES,
  QUERY_RESULTS,
  findQueryFromNaturalLanguage,
  type SuggestedQuery,
  type QueryCategory,
} from '../data/ecommerceSuggestedQueries';

interface QueryExplorerProps {
  onQuerySelect?: (queryId: string) => void;
  onNaturalLanguageQuery?: (query: string) => void;
}

const CATEGORY_OPTIONS: { value: QueryCategory; label: string }[] = [
  { value: 'Customer Analytics', label: 'Customer Analytics' },
  { value: 'Revenue Analytics', label: 'Revenue Analytics' },
  { value: 'Product Analytics', label: 'Product Analytics' },
  { value: 'Inventory', label: 'Inventory' },
  { value: 'Operations', label: 'Operations' },
];

function formatValue(value: unknown, type?: string): string {
  if (value === null || value === undefined) return '-';
  if (type === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value as number);
  }
  if (type === 'percentage') {
    return `${value}%`;
  }
  if (type === 'number') {
    return (value as number).toLocaleString();
  }
  return String(value);
}

export default function QueryExplorer({
  onQuerySelect,
  onNaturalLanguageQuery,
}: QueryExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<QueryCategory | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<SuggestedQuery | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredQueries = selectedCategory
    ? SUGGESTED_QUERIES.filter((q) => q.category === selectedCategory)
    : SUGGESTED_QUERIES;

  const handleQueryClick = (query: SuggestedQuery) => {
    setSelectedQuery(query);
    setShowResults(true);
    onQuerySelect?.(query.id);
  };

  const handleNaturalLanguageSubmit = () => {
    if (!queryInput.trim()) return;

    const matchedQuery = findQueryFromNaturalLanguage(queryInput);
    if (matchedQuery) {
      setSelectedQuery(matchedQuery);
      setShowResults(true);
    }
    onNaturalLanguageQuery?.(queryInput);
    setQueryInput('');
  };

  const getQueryResults = () => {
    if (!selectedQuery) return [];
    return (QUERY_RESULTS[selectedQuery.resultKey] || []) as Record<string, unknown>[];
  };

  const renderResults = () => {
    if (!selectedQuery) return null;

    const results = getQueryResults();

    if (selectedQuery.resultType === 'chart' && selectedQuery.chartType === 'bar') {
      // Render as bar chart
      const chartData = results.slice(0, 7).map((row) => ({
        x: String(row[selectedQuery.columns?.[0]?.id || 'name'] || ''),
        y: Number(row[selectedQuery.columns?.[1]?.id || 'value'] || 0),
      }));

      return (
        <BarChart
          series={[
            {
              title: selectedQuery.columns?.[1]?.header || 'Value',
              type: 'bar',
              data: chartData,
            },
          ]}
          xTitle={selectedQuery.columns?.[0]?.header || 'Category'}
          yTitle={selectedQuery.columns?.[1]?.header || 'Value'}
          height={250}
          hideFilter
          hideLegend
        />
      );
    }

    // Default: render as table
    return (
      <Table
        columnDefinitions={
          selectedQuery.columns?.map((col) => ({
            id: col.id,
            header: col.header,
            cell: (item: Record<string, unknown>) => formatValue(item[col.id], col.type),
          })) || []
        }
        items={results.slice(0, 10)}
        variant="embedded"
        stripedRows
      />
    );
  };

  return (
    <SpaceBetween size="l">
      {/* Header with natural language input */}
      <Container
        header={
          <Header
            variant="h2"
            description="Ask questions in natural language or choose from suggested queries"
          >
            Explore Your Data
          </Header>
        }
      >
        <SpaceBetween size="m">
          <PromptInput
            value={queryInput}
            onChange={({ detail }) => setQueryInput(detail.value)}
            onAction={handleNaturalLanguageSubmit}
            placeholder="Ask a question about your data..."
            actionButtonIconName="search"
          />

          {/* Quick prompts */}
          <SupportPromptGroup
            ariaLabel="Suggested queries"
            onItemClick={({ detail }) => {
              const query = SUGGESTED_QUERIES.find((q) => q.id === detail.id);
              if (query) handleQueryClick(query);
            }}
            items={[
              { id: 'top-customers-ltv', text: 'Show me top customers by revenue' },
              { id: 'category-revenue', text: 'Best-selling categories' },
              { id: 'low-inventory', text: 'Low inventory alerts' },
              { id: 'monthly-revenue', text: 'Monthly revenue trend' },
            ]}
          />
        </SpaceBetween>
      </Container>

      {/* Category filter */}
      <Tiles
        onChange={({ detail }) =>
          setSelectedCategory(detail.value === '' ? null : detail.value as QueryCategory)
        }
        value={selectedCategory || ''}
        items={[
          { value: '', label: 'All', description: 'All queries' },
          ...CATEGORY_OPTIONS.map((cat) => ({
            value: cat.value,
            label: cat.label,
            description: `${SUGGESTED_QUERIES.filter((q) => q.category === cat.value).length} queries`,
          })),
        ]}
      />

      {/* Query list */}
      {!showResults && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px',
          }}
        >
          {filteredQueries.map((query) => (
            <div
              key={query.id}
              onClick={() => handleQueryClick(query)}
              style={{
                border: '1px solid #e9ebed',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0972d3';
                e.currentTarget.style.backgroundColor = '#f2f8fd';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e9ebed';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <SpaceBetween size="xs">
                <Box fontWeight="bold">{query.title}</Box>
                <Box color="text-body-secondary" fontSize="body-s">
                  {query.description}
                </Box>
                <SpaceBetween direction="horizontal" size="xs">
                  <Badge>{query.category}</Badge>
                  <Badge color="grey">{query.resultType}</Badge>
                </SpaceBetween>
              </SpaceBetween>
            </div>
          ))}
        </div>
      )}

      {/* Query results */}
      {showResults && selectedQuery && (
        <Container
          header={
            <Header
              variant="h2"
              description={selectedQuery.description}
              actions={
                <Button onClick={() => setShowResults(false)}>
                  Back to queries
                </Button>
              }
            >
              {selectedQuery.title}
            </Header>
          }
        >
          <SpaceBetween size="l">
            {/* Results visualization */}
            {renderResults()}

            {/* SQL query */}
            <Box>
              <Box variant="h4" margin={{ bottom: 'xs' }}>
                SQL Query
              </Box>
              <CodeView
                content={selectedQuery.sql}
                language="sql"
              />
            </Box>
          </SpaceBetween>
        </Container>
      )}
    </SpaceBetween>
  );
}
