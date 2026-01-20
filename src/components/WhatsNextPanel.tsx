import Cards from '@cloudscape-design/components/cards';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';

export interface WhatsNextOption {
  id: string;
  title: string;
  description: string;
  icon?: string;
  recommended?: boolean;
}

interface WhatsNextPanelProps {
  title?: string;
  description?: string;
  options: WhatsNextOption[];
  onSelect: (optionId: string) => void;
}

export default function WhatsNextPanel({
  title = "What's next?",
  description = "Your database is ready. Choose how to get started:",
  options,
  onSelect,
}: WhatsNextPanelProps) {
  return (
    <SpaceBetween size="m">
      <Box>
        <Box variant="h2" fontSize="heading-l" fontWeight="bold">
          {title}
        </Box>
        <Box color="text-body-secondary" margin={{ top: 'xs' }}>
          {description}
        </Box>
      </Box>

      <Cards
        cardDefinition={{
          header: (item) => (
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Box fontSize="heading-m" fontWeight="bold">
                {item.title}
              </Box>
              {item.recommended && (
                <Badge color="green">Recommended</Badge>
              )}
            </SpaceBetween>
          ),
          sections: [
            {
              id: 'description',
              content: (item) => (
                <Box color="text-body-secondary">
                  {item.description}
                </Box>
              ),
            },
            {
              id: 'action',
              content: (item) => (
                <Button
                  variant={item.recommended ? 'primary' : 'normal'}
                  onClick={() => onSelect(item.id)}
                >
                  {item.recommended ? 'Get started' : 'Select'}
                </Button>
              ),
            },
          ],
        }}
        items={options}
        cardsPerRow={[
          { cards: 1 },
          { minWidth: 500, cards: 3 },
        ]}
      />
    </SpaceBetween>
  );
}
