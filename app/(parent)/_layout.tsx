
import React from 'react';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function ParentLayout() {
  const tabs = [
    { route: '/(parent)/dashboard', label: 'Home', icon: 'house' },
    { route: '/(parent)/children', label: 'Children', icon: 'people' },
    { route: '/(parent)/attendance', label: 'Attendance', icon: 'check.circle' },
    { route: '/(parent)/events', label: 'Events', icon: 'event' },
    { route: '/(parent)/announcements', label: 'News', icon: 'megaphone' },
  ];

  return <FloatingTabBar tabs={tabs} />;
}
