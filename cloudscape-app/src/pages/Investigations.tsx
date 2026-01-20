import { useState } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Grid from '@cloudscape-design/components/grid';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Textarea from '@cloudscape-design/components/textarea';
import FormField from '@cloudscape-design/components/form-field';
import Table from '@cloudscape-design/components/table';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import BarChart from '@cloudscape-design/components/bar-chart';
import Select from '@cloudscape-design/components/select';
import TextFilter from '@cloudscape-design/components/text-filter';
import Tabs from '@cloudscape-design/components/tabs';
import Badge from '@cloudscape-design/components/badge';
import Pagination from '@cloudscape-design/components/pagination';
import {
  MOCK_INVESTIGATIONS,
  QUICK_TAGS,
  INVESTIGATION_FREQUENCY,
  SANDBOX_ENVIRONMENTS,
  formatInvestigationDate,
  formatInvestigationTime,
  type Investigation,
} from '../data/investigationsMockData';

// Quick tag button component
function QuickTagButton({
  tag,
  selected,
  onClick,
}: {
  tag: { id: string; text: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={selected ? 'primary' : 'normal'}
      onClick={onClick}
    >
      {tag.text}
    </Button>
  );
}


export default function Investigations() {
  const [investigationDescription, setInvestigationDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(SANDBOX_ENVIRONMENTS[0]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  // Filter investigations
  const filteredInvestigations = MOCK_INVESTIGATIONS.filter((inv) => {
    const matchesText =
      inv.id.toLowerCase().includes(filterText.toLowerCase()) ||
      inv.description.toLowerCase().includes(filterText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesText && matchesStatus;
  });

  // Get status indicator type
  const getStatusType = (
    status: Investigation['status']
  ): 'success' | 'in-progress' | 'error' | 'pending' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'in-progress';
      case 'failed':
        return 'error';
      default:
        return 'pending';
    }
  };

  // Bar chart data for investigation frequency
  const barChartData = [
    {
      title: 'Investigations',
      type: 'bar' as const,
      data: INVESTIGATION_FREQUENCY.map((d) => ({ x: d.day, y: d.count })),
      color: '#0972d3',
    },
  ];

  // Start investigation handler
  const handleStartInvestigation = () => {
    console.log('Starting investigation:', {
      description: investigationDescription,
      tags: selectedTags,
      environment: selectedEnvironment,
    });
    // In a real app, this would trigger the investigation workflow
  };

  return (
    <ContentLayout
      defaultPadding
      header={
        <Header
          variant="h1"
          description="Investigate and resolve active incidents"
        >
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            <span>RDS AI Firefighter</span>
          </SpaceBetween>
        </Header>
      }
    >
      <Grid
        gridDefinition={[
          { colspan: { default: 12, s: 3 } },
          { colspan: { default: 12, s: 9 } },
        ]}
      >
        {/* Left Sidebar */}
        <div>
          <Box padding={{ bottom: 'l' }}>
            <Box color="text-body-secondary" fontSize="body-s" padding={{ bottom: 'xs' }}>
              Riot Games Database Operations
            </Box>
          </Box>
          <Container>
            <SpaceBetween size="xs">
              <Box fontWeight="bold" color="text-label">
                Monitoring Center
              </Box>
              <Box color="text-body-secondary" fontSize="body-s">
                Incident management and proactive prevention
              </Box>
            </SpaceBetween>
          </Container>
          <Box padding={{ top: 'l' }}>
            <Box fontWeight="bold" fontSize="body-s" color="text-label" padding={{ bottom: 'xs' }}>
              AI ASSISTANT
            </Box>
            <Badge color="blue">FLEET-WIDE</Badge>
          </Box>
        </div>

        {/* Main Content */}
        <SpaceBetween size="l">
          {/* Tabs */}
          <Tabs
            tabs={[
              {
                label: 'Overview',
                id: 'overview',
                content: (
                  <Box padding="l" textAlign="center" color="text-body-secondary">
                    Overview dashboard coming soon
                  </Box>
                ),
              },
              {
                label: 'Incident Response',
                id: 'incident-response',
                content: (
                  <SpaceBetween size="l">
                    <Grid
                      gridDefinition={[
                        { colspan: { default: 12, s: 6 } },
                        { colspan: { default: 12, s: 6 } },
                      ]}
                    >
                      {/* Start Investigation Form */}
                      <Container header={<Header variant="h3">Start an investigation</Header>}>
                        <SpaceBetween size="m">
                          <Box color="text-body-secondary" fontSize="body-s">
                            Describe the investigation you'd like to run. Include any details you
                            can about the investigation goals, areas to explore, or relevant
                            information.
                          </Box>
                          <FormField>
                            <Textarea
                              value={investigationDescription}
                              onChange={({ detail }) =>
                                setInvestigationDescription(detail.value)
                              }
                              placeholder="Describe your investigation..."
                              rows={4}
                            />
                          </FormField>

                          {/* Quick Tags */}
                          <Box>
                            <SpaceBetween size="xs">
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {QUICK_TAGS.slice(0, 5).map((tag) => (
                                  <QuickTagButton
                                    key={tag.id}
                                    tag={tag}
                                    selected={selectedTags.includes(tag.id)}
                                    onClick={() => toggleTag(tag.id)}
                                  />
                                ))}
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {QUICK_TAGS.slice(5).map((tag) => (
                                  <QuickTagButton
                                    key={tag.id}
                                    tag={tag}
                                    selected={selectedTags.includes(tag.id)}
                                    onClick={() => toggleTag(tag.id)}
                                  />
                                ))}
                              </div>
                            </SpaceBetween>
                          </Box>

                          {/* Sandbox Environment */}
                          <FormField label="Sandbox Environment:">
                            <Select
                              selectedOption={selectedEnvironment}
                              onChange={({ detail }) =>
                                setSelectedEnvironment(
                                  detail.selectedOption as typeof selectedEnvironment
                                )
                              }
                              options={SANDBOX_ENVIRONMENTS}
                            />
                          </FormField>

                          <Button
                            variant="primary"
                            onClick={handleStartInvestigation}
                            disabled={!investigationDescription.trim()}
                          >
                            Start investigation
                          </Button>
                        </SpaceBetween>
                      </Container>

                      {/* Daily Investigation Frequency Chart */}
                      <Container
                        header={<Header variant="h3">Daily investigation frequency</Header>}
                      >
                        <BarChart
                          series={barChartData}
                          xDomain={INVESTIGATION_FREQUENCY.map((d) => d.day)}
                          yDomain={[0, 6]}
                          xTitle=""
                          yTitle=""
                          height={200}
                          hideFilter
                          hideLegend
                        />
                      </Container>
                    </Grid>

                    {/* Investigations Table */}
                    <Container
                      header={
                        <Header
                          variant="h3"
                          actions={
                            <SpaceBetween direction="horizontal" size="xs">
                              <TextFilter
                                filteringText={filterText}
                                filteringPlaceholder="Search investigations..."
                                onChange={({ detail }) => setFilterText(detail.filteringText)}
                              />
                              <Select
                                selectedOption={{ value: statusFilter, label: statusFilter === 'all' ? 'All Statuses' : statusFilter }}
                                onChange={({ detail }) =>
                                  setStatusFilter(detail.selectedOption.value || 'all')
                                }
                                options={[
                                  { value: 'all', label: 'All Statuses' },
                                  { value: 'completed', label: 'Completed' },
                                  { value: 'in_progress', label: 'In Progress' },
                                  { value: 'failed', label: 'Failed' },
                                ]}
                              />
                            </SpaceBetween>
                          }
                        >
                          Investigations
                        </Header>
                      }
                    >
                      <Table
                        items={filteredInvestigations.slice(
                          (currentPage - 1) * pageSize,
                          currentPage * pageSize
                        )}
                        columnDefinitions={[
                          {
                            id: 'investigation',
                            header: 'INVESTIGATION',
                            cell: (item) => item.id,
                            sortingField: 'id',
                            width: 300,
                          },
                          {
                            id: 'status',
                            header: 'STATUS',
                            cell: (item) => (
                              <StatusIndicator type={getStatusType(item.status)}>
                                {item.status.toUpperCase().replace('_', ' ')}
                              </StatusIndicator>
                            ),
                            width: 150,
                          },
                          {
                            id: 'started',
                            header: 'STARTED',
                            cell: (item) => (
                              <SpaceBetween size="xxxs">
                                <Box>{formatInvestigationDate(item.startedAt)}</Box>
                                <Box color="text-body-secondary" fontSize="body-s">
                                  {formatInvestigationTime(item.startedAt)}
                                </Box>
                              </SpaceBetween>
                            ),
                            width: 150,
                          },
                          {
                            id: 'lastUpdated',
                            header: 'LAST UPDATED',
                            cell: (item) => (
                              <SpaceBetween size="xxxs">
                                <Box>{formatInvestigationDate(item.lastUpdated)}</Box>
                                <Box color="text-body-secondary" fontSize="body-s">
                                  {formatInvestigationTime(item.lastUpdated)}
                                </Box>
                              </SpaceBetween>
                            ),
                            width: 150,
                          },
                        ]}
                        variant="embedded"
                        stripedRows
                        empty={
                          <Box textAlign="center" color="text-body-secondary" padding="l">
                            No investigations found
                          </Box>
                        }
                        pagination={
                          filteredInvestigations.length > pageSize ? (
                            <Pagination
                              currentPageIndex={currentPage}
                              pagesCount={Math.ceil(filteredInvestigations.length / pageSize)}
                              onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                            />
                          ) : undefined
                        }
                      />
                    </Container>
                  </SpaceBetween>
                ),
              },
              {
                label: 'Prevention',
                id: 'prevention',
                content: (
                  <Box padding="l" textAlign="center" color="text-body-secondary">
                    Prevention strategies coming soon
                  </Box>
                ),
              },
              {
                label: 'Topology',
                id: 'topology',
                content: (
                  <Box padding="l" textAlign="center" color="text-body-secondary">
                    Database topology visualization coming soon
                  </Box>
                ),
              },
            ]}
            activeTabId="incident-response"
          />
        </SpaceBetween>
      </Grid>
    </ContentLayout>
  );
}
