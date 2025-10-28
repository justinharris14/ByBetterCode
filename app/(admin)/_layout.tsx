
import React from 'react';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function AdminLayout() {
  const tabs = [
    { route: '/(admin)/dashboard', label: 'Home', icon: 'house' },
    { route: '/(admin)/children', label: 'Children', icon: 'people' },
    { route: '/(admin)/attendance', label: 'Attendance', icon: 'check.circle' },
    { route: '/(admin)/events', label: 'Events', icon: 'event' },
    { route: '/(admin)/announcements', label: 'News', icon: 'megaphone' },
  ];

  return <FloatingTabBar tabs={tabs} />;
}
