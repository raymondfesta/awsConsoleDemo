import { useState, useMemo } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Grid from '@cloudscape-design/components/grid';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Badge from '@cloudscape-design/components/badge';
import Icon from '@cloudscape-design/components/icon';
import TextFilter from '@cloudscape-design/components/text-filter';
import Multiselect from '@cloudscape-design/components/multiselect';
import Select from '@cloudscape-design/components/select';
import Toggle from '@cloudscape-design/components/toggle';
import Spinner from '@cloudscape-design/components/spinner';
import Link from '@cloudscape-design/components/link';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import { useAppStore } from '../context/AppContext';
import { ActionModal } from '../components/recommendations';
import {
  getSeverityColor,
  getStatusColor,
  getStatusDisplayText,
  type Recommendation,
  type RecommendationStatus,
} from '../data/recommendationsMockData';

// Severity color mapping for left border accent
const severityBorderColors: Record<string, string> = {
  high: '#d91515',
  medium: '#0972d3',
  low: '#5f6b7a',
};

// Key metric card with large number and trend indicator
function MetricCard({
  title,
  value,
  description,
  trend,
  trendDirection,
}: {
  title: string;
  value: string | number;
  description?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}) {
  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-status-success';
    if (trendDirection === 'down') return 'text-status-error';
    return 'text-body-secondary';
  };

  return (
    <Container fitHeight>
      <SpaceBetween size="xxs">
        <Box color="text-body-secondary" fontSize="body-s">
          {title}
        </Box>
        <Box fontSize="display-l" fontWeight="bold">
          {value}
        </Box>
        {(description || trend) && (
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            {trend && (
              <Box color={getTrendColor()} fontSize="body-s">
                {trendDirection === 'up' && '↑'}
                {trendDirection === 'down' && '↓'}
                {trend}
              </Box>
            )}
            {description && (
              <Box color="text-body-secondary" fontSize="body-s">
                {description}
              </Box>
            )}
          </SpaceBetween>
        )}
      </SpaceBetween>
    </Container>
  );
}

// Feedback component with improved layout
function FeedbackPanel({
  recommendation,
  onFeedback,
}: {
  recommendation: Recommendation;
  onFeedback: (helpful: boolean) => void;
}) {
  const feedback = recommendation.feedback;

  if (recommendation.status !== 'applied') {
    return null;
  }

  return (
    <Box
      padding={{ vertical: 's', horizontal: 'm' }}
      color="text-body-secondary"
    >
      <SpaceBetween direction="horizontal" size="m" alignItems="center">
        <Box fontSize="body-s">Was this recommendation helpful?</Box>
        <SpaceBetween direction="horizontal" size="xs">
          <Button
            variant={feedback?.helpful === true ? 'primary' : 'normal'}
            iconName="thumbs-up"
            onClick={() => onFeedback(true)}
            ariaLabel="Yes, helpful"
          />
          <Button
            variant={feedback?.helpful === false ? 'primary' : 'normal'}
            iconName="thumbs-down"
            onClick={() => onFeedback(false)}
            ariaLabel="No, not helpful"
          />
        </SpaceBetween>
        {feedback?.helpful !== null && feedback?.helpful !== undefined && (
          <Badge color="green">Feedback submitted</Badge>
        )}
      </SpaceBetween>
    </Box>
  );
}

// Enhanced Prediction card with cleaner layout
function PredictionCard({
  recommendation,
  onTakeAction,
  onDismiss,
  onFeedback,
}: {
  recommendation: Recommendation;
  onTakeAction: () => void;
  onDismiss: () => void;
  onFeedback: (helpful: boolean) => void;
}) {
  const isInProgress = recommendation.status === 'in_progress';
  const isApplied = recommendation.status === 'applied';
  const borderColor = severityBorderColors[recommendation.severity] || '#5f6b7a';

  return (
    <div
      style={{
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '8px',
        background: 'var(--color-background-container-content)',
        boxShadow: '0 1px 1px 0 rgba(0, 28, 36, 0.3), 1px 1px 1px 0 rgba(0, 28, 36, 0.15)',
      }}
    >
      <SpaceBetween size="xs">
        {/* Card Header */}
        <Box padding={{ top: 'm', horizontal: 'm' }}>
          <SpaceBetween size="s">
            {/* Status badges row */}
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Badge color={getSeverityColor(recommendation.severity)}>
                {recommendation.severity.toUpperCase()}
              </Badge>
              <Badge color={getStatusColor(recommendation.status)}>
                {isInProgress ? (
                  <SpaceBetween direction="horizontal" size="xxs" alignItems="center">
                    <Spinner />
                    <span>Applying</span>
                  </SpaceBetween>
                ) : (
                  getStatusDisplayText(recommendation.status)
                )}
              </Badge>
              <Badge color="grey">{recommendation.category}</Badge>
              <Box color="text-body-secondary" fontSize="body-s">
                <SpaceBetween direction="horizontal" size="xxs" alignItems="center">
                  <Icon name="calendar" size="small" />
                  <span>{recommendation.timeframe}</span>
                </SpaceBetween>
              </Box>
            </SpaceBetween>

            {/* Title */}
            <Box variant="h3" padding={{ top: 'xxs' }}>
              <Link fontSize="heading-m" onFollow={(e) => e.preventDefault()}>
                {recommendation.title}
              </Link>
            </Box>

            {/* Description */}
            <Box color="text-body-secondary">{recommendation.description}</Box>
          </SpaceBetween>
        </Box>

        {/* Card Body - Details Grid */}
        <Box padding={{ horizontal: 'm' }}>
          <ColumnLayout columns={3} variant="text-grid">
            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                Confidence
              </Box>
              <ProgressBar
                value={recommendation.confidence}
                variant="standalone"
                additionalInfo={`${recommendation.confidence}%`}
              />
            </SpaceBetween>
            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                Database
              </Box>
              <Box>{recommendation.database || 'N/A'}</Box>
            </SpaceBetween>
            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                Impact
              </Box>
              <Box>{recommendation.estimatedImpact || 'Performance improvement'}</Box>
            </SpaceBetween>
          </ColumnLayout>
        </Box>

        {/* Suggested Action */}
        {recommendation.suggestedAction && (
          <Box padding={{ horizontal: 'm' }}>
            <Box
              padding="s"
              color="text-body-secondary"
              fontSize="body-s"
            >
              <SpaceBetween direction="horizontal" size="xs" alignItems="start">
                <Icon name="status-info" />
                <Box>
                  <Box fontWeight="bold">Suggested action</Box>
                  <Box>{recommendation.suggestedAction}</Box>
                </Box>
              </SpaceBetween>
            </Box>
          </Box>
        )}

        {/* Applied timestamp */}
        {recommendation.appliedAt && (
          <Box padding={{ horizontal: 'm' }}>
            <Box color="text-status-success" fontSize="body-s">
              <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                <Icon name="status-positive" variant="success" />
                <span>Applied on {recommendation.appliedAt.toLocaleString()}</span>
              </SpaceBetween>
            </Box>
          </Box>
        )}

        {/* Card Footer - Actions */}
        <Box
          padding="m"
        >
          <SpaceBetween direction="horizontal" size="xs">
            {!isApplied && !isInProgress && (
              <>
                <Button variant="primary" onClick={onTakeAction}>
                  Take action
                </Button>
                <Button variant="normal" onClick={onDismiss}>
                  Dismiss
                </Button>
              </>
            )}
            {isInProgress && (
              <Button variant="primary" disabled loading>
                Applying changes...
              </Button>
            )}
            {isApplied && (
              <Button variant="normal" disabled iconName="status-positive">
                Applied successfully
              </Button>
            )}
          </SpaceBetween>
        </Box>

        {/* Feedback Section */}
        <FeedbackPanel recommendation={recommendation} onFeedback={onFeedback} />
      </SpaceBetween>
    </div>
  );
}

// Sort options
const SORT_OPTIONS = [
  { label: 'Severity (High to Low)', value: 'severity' },
  { label: 'Confidence (High to Low)', value: 'confidence' },
  { label: 'Newest First', value: 'created' },
];

export default function Recommendations() {
  const [filterText, setFilterText] = useState('');
  const [showDismissed, setShowDismissed] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);

  // Get state and actions from store
  const {
    recommendations,
    recommendationFilters,
    applyRecommendation,
    completeRecommendation,
    dismissRecommendation,
    undoDismissRecommendation,
    submitRecommendationFeedback,
    setRecommendationFilters,
    clearRecommendationFilters,
    addNotification,
  } = useAppStore();

  // Get unique categories for filter options
  const uniqueCategories = useMemo(() => {
    return [...new Set(recommendations.map((r) => r.category))];
  }, [recommendations]);

  // Check if any filters are active
  const hasActiveFilters =
    recommendationFilters.category.length > 0 ||
    recommendationFilters.severity.length > 0 ||
    recommendationFilters.status.length > 0;

  // Filter and sort recommendations
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations.filter((rec) => {
      const matchesText =
        rec.title.toLowerCase().includes(filterText.toLowerCase()) ||
        rec.description.toLowerCase().includes(filterText.toLowerCase()) ||
        rec.category.toLowerCase().includes(filterText.toLowerCase());

      const matchesCategory =
        recommendationFilters.category.length === 0 ||
        recommendationFilters.category.includes(rec.category);

      const matchesSeverity =
        recommendationFilters.severity.length === 0 ||
        recommendationFilters.severity.includes(rec.severity);

      const matchesStatus =
        recommendationFilters.status.length === 0 ||
        recommendationFilters.status.includes(rec.status);

      const matchesDismissed = showDismissed || rec.status !== 'dismissed';

      return matchesText && matchesCategory && matchesSeverity && matchesStatus && matchesDismissed;
    });

    filtered = [...filtered].sort((a, b) => {
      switch (sortOption.value) {
        case 'severity': {
          const severityOrder = { high: 0, medium: 1, low: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        case 'confidence':
          return b.confidence - a.confidence;
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [recommendations, filterText, recommendationFilters, showDismissed, sortOption]);

  // Calculate stats
  const stats = useMemo(() => {
    const active = recommendations.filter((r) => r.status !== 'dismissed');
    const high = active.filter((r) => r.severity === 'high').length;
    const applied = recommendations.filter((r) => r.status === 'applied').length;
    const avgConfidence = active.length > 0
      ? Math.round(active.reduce((sum, r) => sum + r.confidence, 0) / active.length)
      : 0;
    return { total: active.length, high, applied, avgConfidence };
  }, [recommendations]);

  const dismissedCount = recommendations.filter((r) => r.status === 'dismissed').length;
  const activeRecommendations = filteredRecommendations.filter((r) => r.status !== 'dismissed');
  const dismissedRecommendations = filteredRecommendations.filter((r) => r.status === 'dismissed');

  // Handlers
  const handleTakeAction = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setModalVisible(true);
  };

  const handleApply = (id: string) => {
    applyRecommendation(id);
    addNotification({
      type: 'info',
      content: 'Recommendation is being applied...',
      dismissible: true,
    });

    setTimeout(() => {
      completeRecommendation(id);
      addNotification({
        type: 'success',
        content: 'Recommendation has been successfully applied!',
        dismissible: true,
      });
    }, 2000);
  };

  const handleDismiss = (id: string) => {
    dismissRecommendation(id);
    addNotification({
      type: 'info',
      content: 'Recommendation dismissed',
      dismissible: true,
    });
  };

  const handleUndoDismiss = (id: string) => {
    undoDismissRecommendation(id);
    addNotification({
      type: 'success',
      content: 'Recommendation restored',
      dismissible: true,
    });
  };

  const handleFeedback = (id: string, helpful: boolean) => {
    submitRecommendationFeedback(id, { helpful });
    addNotification({
      type: 'success',
      content: 'Thank you for your feedback!',
      dismissible: true,
    });
  };

  return (
    <ContentLayout
      defaultPadding
      header={
        <Header
          variant="h1"
          description="AI-powered insights from continuous database analysis to prevent issues and optimize performance"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button iconName="refresh">Refresh</Button>
              <Button iconName="download">Export</Button>
            </SpaceBetween>
          }
        >
          Predictive Recommendations
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Key Metrics Row */}
        <Grid
          gridDefinition={[
            { colspan: { default: 6, s: 3 } },
            { colspan: { default: 6, s: 3 } },
            { colspan: { default: 6, s: 3 } },
            { colspan: { default: 6, s: 3 } },
          ]}
        >
          <MetricCard
            title="Active recommendations"
            value={stats.total}
            trend="+2 this week"
            trendDirection="up"
          />
          <MetricCard
            title="High priority"
            value={stats.high}
            description="Requires immediate attention"
          />
          <MetricCard
            title="Applied"
            value={stats.applied}
            description="Successfully implemented"
          />
          <MetricCard
            title="Avg confidence"
            value={`${stats.avgConfidence}%`}
            description="Prediction accuracy"
          />
        </Grid>

        {/* Filter Bar */}
        <Container>
          <SpaceBetween size="s">
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Box fontWeight="bold">Filters</Box>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearRecommendationFilters}>
                  Clear all
                </Button>
              )}
            </SpaceBetween>
            <Grid
              gridDefinition={[
                { colspan: { default: 12, s: 3 } },
                { colspan: { default: 12, s: 3 } },
                { colspan: { default: 12, s: 3 } },
                { colspan: { default: 12, s: 3 } },
              ]}
            >
              <Multiselect
                selectedOptions={recommendationFilters.severity.map((s) => ({
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                  value: s,
                }))}
                options={[
                  { label: 'High', value: 'high' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Low', value: 'low' },
                ]}
                placeholder="Severity"
                onChange={({ detail }) =>
                  setRecommendationFilters({
                    severity: detail.selectedOptions.map((o) => o.value!),
                  })
                }
              />
              <Multiselect
                selectedOptions={recommendationFilters.category.map((c) => ({
                  label: c.charAt(0).toUpperCase() + c.slice(1),
                  value: c,
                }))}
                options={uniqueCategories.map((cat) => ({
                  label: cat.charAt(0).toUpperCase() + cat.slice(1),
                  value: cat,
                }))}
                placeholder="Category"
                onChange={({ detail }) =>
                  setRecommendationFilters({
                    category: detail.selectedOptions.map((o) => o.value!),
                  })
                }
              />
              <Multiselect
                selectedOptions={recommendationFilters.status.map((s) => ({
                  label: getStatusDisplayText(s as RecommendationStatus),
                  value: s,
                }))}
                options={[
                  { label: 'Pending', value: 'pending' },
                  { label: 'In Progress', value: 'in_progress' },
                  { label: 'Applied', value: 'applied' },
                  { label: 'Dismissed', value: 'dismissed' },
                ]}
                placeholder="Status"
                onChange={({ detail }) =>
                  setRecommendationFilters({
                    status: detail.selectedOptions.map((o) => o.value!),
                  })
                }
              />
              <Select
                selectedOption={sortOption}
                options={SORT_OPTIONS}
                onChange={({ detail }) => setSortOption(detail.selectedOption as typeof sortOption)}
              />
            </Grid>
          </SpaceBetween>
        </Container>

        {/* Main Recommendations List */}
        <SpaceBetween size="s">
          <SpaceBetween direction="horizontal" size="s" alignItems="center">
            <Header variant="h2" counter={`(${activeRecommendations.length})`}>
              Recommendations
            </Header>
            <TextFilter
              filteringText={filterText}
              filteringPlaceholder="Search recommendations..."
              onChange={({ detail }) => setFilterText(detail.filteringText)}
            />
          </SpaceBetween>

          {activeRecommendations.length === 0 ? (
            <Container>
              <Box textAlign="center" padding="xl" color="text-body-secondary">
                <SpaceBetween size="s" alignItems="center">
                  <Icon name="search" size="big" />
                  <Box variant="h3">No recommendations found</Box>
                  <Box>Try adjusting your filters or search terms</Box>
                  {hasActiveFilters && (
                    <Button onClick={clearRecommendationFilters}>Clear filters</Button>
                  )}
                </SpaceBetween>
              </Box>
            </Container>
          ) : (
            <SpaceBetween size="m">
              {activeRecommendations.map((recommendation) => (
                <PredictionCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onTakeAction={() => handleTakeAction(recommendation)}
                  onDismiss={() => handleDismiss(recommendation.id)}
                  onFeedback={(helpful) => handleFeedback(recommendation.id, helpful)}
                />
              ))}
            </SpaceBetween>
          )}
        </SpaceBetween>

        {/* Dismissed Section */}
        {dismissedCount > 0 && (
          <Container
            header={
              <Header
                variant="h2"
                counter={`(${dismissedCount})`}
                actions={
                  <Toggle
                    checked={showDismissed}
                    onChange={({ detail }) => setShowDismissed(detail.checked)}
                  >
                    Show dismissed
                  </Toggle>
                }
              >
                Dismissed recommendations
              </Header>
            }
          >
            {showDismissed ? (
              dismissedRecommendations.length > 0 ? (
                <SpaceBetween size="s">
                  {dismissedRecommendations.map((rec) => (
                    <div
                      key={rec.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--color-border-divider-default)',
                      }}
                    >
                      <SpaceBetween direction="horizontal" size="m" alignItems="center">
                        <Icon name="status-stopped" />
                        <Box variant="span" fontWeight="bold">
                          {rec.title}
                        </Box>
                        <Badge color="grey">{rec.category}</Badge>
                        {rec.dismissedAt && (
                          <Box color="text-body-secondary" fontSize="body-s">
                            Dismissed {rec.dismissedAt.toLocaleDateString()}
                          </Box>
                        )}
                      </SpaceBetween>
                      <Button variant="link" onClick={() => handleUndoDismiss(rec.id)}>
                        Restore
                      </Button>
                    </div>
                  ))}
                </SpaceBetween>
              ) : (
                <Box textAlign="center" padding="m" color="text-body-secondary">
                  No dismissed recommendations match current filters
                </Box>
              )
            ) : (
              <Box textAlign="center" padding="m" color="text-body-secondary">
                Toggle to view dismissed recommendations
              </Box>
            )}
          </Container>
        )}
      </SpaceBetween>

      {/* Action Modal */}
      <ActionModal
        recommendation={selectedRecommendation}
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false);
          setSelectedRecommendation(null);
        }}
        onApply={handleApply}
      />
    </ContentLayout>
  );
}
