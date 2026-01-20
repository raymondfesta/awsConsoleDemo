import Box from '@cloudscape-design/components/box';
import Spinner from '@cloudscape-design/components/spinner';

interface ChatDrawerHeaderProps {
  title: string;
  subtitle?: string;
  showActivityIndicator?: boolean;
}

export default function ChatDrawerHeader({
  title,
  subtitle,
  showActivityIndicator = false,
}: ChatDrawerHeaderProps) {
  return (
    <div style={{
      borderBottom: '2px solid var(--color-border-divider-default)',
      backgroundColor: 'var(--color-background-container-content)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        // Add right padding to avoid overlap with Cloudscape's built-in close button
        paddingRight: '48px',
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Box variant="h3" fontSize="heading-s">{title}</Box>
          {showActivityIndicator && (
            <Spinner size="normal" />
          )}
          {subtitle && (
            <Box color="text-body-secondary" fontSize="body-s">{subtitle}</Box>
          )}
        </div>
      </div>
    </div>
  );
}
