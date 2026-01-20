import SideNavigation, { type SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import { useNavigate, useLocation } from 'react-router-dom';
import Badge from '@cloudscape-design/components/badge';
import { useAppStore } from '../context/AppContext';
import { ALERT_SUMMARY } from '../data/alertsMockData';

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
    {
      type: 'link',
      text: 'Alerts',
      href: '/alerts',
      info: ALERT_SUMMARY.critical > 0 ? <Badge color="red">{ALERT_SUMMARY.critical}</Badge> : undefined,
    },
    {
      type: 'link',
      text: 'Recommendations',
      href: '/recommendations',
    },
  ];

  return (
    <SideNavigation
      activeHref={location.pathname}
      header={{
        text: 'Amazon Databases',
        href: '/amazon-databases',
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
