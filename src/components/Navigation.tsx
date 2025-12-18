import SideNavigation, { type SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import { useNavigate, useLocation } from 'react-router-dom';
import Badge from '@cloudscape-design/components/badge';
import { useAppStore } from '../context/AppContext';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { databases } = useAppStore();

  const navItems: SideNavigationProps.Item[] = [
    {
      type: 'link',
      text: 'Dashboard',
      href: '/',
    },
    {
      type: 'link',
      text: 'Databases',
      href: '/databases',
      info: databases.length > 0 ? <Badge color="blue">{databases.length}</Badge> : undefined,
    },
    { type: 'divider' },
    {
      type: 'section',
      text: 'Actions',
      items: [
        {
          type: 'link',
          text: 'Create database',
          href: '/create-database',
        },
        {
          type: 'link',
          text: 'Import data',
          href: '/import-data',
        },
        {
          type: 'link',
          text: 'Query editor',
          href: '/query-editor',
        },
      ],
    },
    {
      type: 'section',
      text: 'Administration',
      items: [
        {
          type: 'link',
          text: 'Settings',
          href: '/settings',
        },
      ],
    },
    { type: 'divider' },
    {
      type: 'link',
      text: 'Documentation',
      href: 'https://docs.aws.amazon.com/aurora-dsql/',
      external: true,
    },
    {
      type: 'link',
      text: 'AWS Console',
      href: 'https://console.aws.amazon.com/',
      external: true,
    },
  ];

  return (
    <SideNavigation
      activeHref={location.pathname}
      header={{
        text: 'Aurora DSQL',
        href: '/',
      }}
      onFollow={(event) => {
        if (!event.detail.external) {
          event.preventDefault();
          navigate(event.detail.href);
        }
      }}
      items={navItems}
    />
  );
}
