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
      ],
    },
  ];

  return (
    <SideNavigation
      activeHref={location.pathname}
      header={{
        text: 'UDE Console',
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
