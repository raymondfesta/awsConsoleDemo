import { useState } from 'react';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Badge from '@cloudscape-design/components/badge';
import Toggle from '@cloudscape-design/components/toggle';
import FormField from '@cloudscape-design/components/form-field';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import Alert from '@cloudscape-design/components/alert';
import {
  type Recommendation,
  getSeverityColor,
  getStatusDisplayText,
} from '../../data/recommendationsMockData';

interface ActionModalProps {
  recommendation: Recommendation | null;
  visible: boolean;
  onDismiss: () => void;
  onApply: (id: string) => void;
}

export default function ActionModal({
  recommendation,
  visible,
  onDismiss,
  onApply,
}: ActionModalProps) {
  const [notifyOnCompletion, setNotifyOnCompletion] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);

  if (!recommendation) return null;

  const handleApply = () => {
    setIsApplying(true);
    setApplyProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setApplyProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsApplying(false);
            setApplyProgress(0);
            onApply(recommendation.id);
            onDismiss();
          }, 500);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header="Apply Recommendation"
      size="medium"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss} disabled={isApplying}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply} disabled={isApplying} loading={isApplying}>
              {isApplying ? 'Applying...' : 'Apply Now'}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="l">
        {/* Recommendation Summary */}
        <SpaceBetween size="xs">
          <SpaceBetween direction="horizontal" size="xs">
            <Badge color={getSeverityColor(recommendation.severity)}>
              {recommendation.severity.charAt(0).toUpperCase() + recommendation.severity.slice(1)} Priority
            </Badge>
            <Badge color="grey">{recommendation.category}</Badge>
            <Badge color="green">{recommendation.confidence}% confidence</Badge>
          </SpaceBetween>
          <Box variant="h3">{recommendation.title}</Box>
          <Box color="text-body-secondary">{recommendation.description}</Box>
        </SpaceBetween>

        {/* Details */}
        <ColumnLayout columns={2} variant="text-grid">
          <SpaceBetween size="xxs">
            <Box color="text-body-secondary" fontSize="body-s">
              Database
            </Box>
            <Box>{recommendation.database || 'N/A'}</Box>
          </SpaceBetween>
          <SpaceBetween size="xxs">
            <Box color="text-body-secondary" fontSize="body-s">
              Timeframe
            </Box>
            <Box>{recommendation.timeframe}</Box>
          </SpaceBetween>
          <SpaceBetween size="xxs">
            <Box color="text-body-secondary" fontSize="body-s">
              Current Status
            </Box>
            <Box>{getStatusDisplayText(recommendation.status)}</Box>
          </SpaceBetween>
          <SpaceBetween size="xxs">
            <Box color="text-body-secondary" fontSize="body-s">
              Created
            </Box>
            <Box>{recommendation.createdAt.toLocaleString()}</Box>
          </SpaceBetween>
        </ColumnLayout>

        {/* Suggested Action */}
        {recommendation.suggestedAction && (
          <Alert type="info" header="Suggested Action">
            {recommendation.suggestedAction}
          </Alert>
        )}

        {/* Expected Impact */}
        {recommendation.estimatedImpact && (
          <SpaceBetween size="xxs">
            <Box fontWeight="bold" fontSize="body-s">
              Expected Impact
            </Box>
            <Box color="text-body-secondary">{recommendation.estimatedImpact}</Box>
          </SpaceBetween>
        )}

        {/* Configuration Options */}
        <SpaceBetween size="s">
          <Box variant="h4">Configuration</Box>
          <FormField label="Notification">
            <Toggle
              checked={notifyOnCompletion}
              onChange={({ detail }) => setNotifyOnCompletion(detail.checked)}
            >
              Notify me when the action completes
            </Toggle>
          </FormField>
        </SpaceBetween>

        {/* Progress Bar (shown when applying) */}
        {isApplying && (
          <ProgressBar
            value={applyProgress}
            label="Applying recommendation"
            description={
              applyProgress < 100
                ? 'Please wait while the recommendation is being applied...'
                : 'Complete!'
            }
            status={applyProgress >= 100 ? 'success' : 'in-progress'}
          />
        )}
      </SpaceBetween>
    </Modal>
  );
}
