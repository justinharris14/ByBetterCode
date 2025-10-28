
import React from 'react';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function ParentLayout() {
  const tabs = [
    { name: 'dashboard', route: '/(parent)/dashboard', label: 'Home', icon: 'house' },
    { name: 'children', route: '/(parent)/children', label: 'Children', icon: 'people' },
    { name: 'attendance', route: '/(parent)/attendance', label: 'Attendance', icon: 'check.circle' },
    { name: 'events', route: '/(parent)/events', label: 'Events', icon: 'event' },
    { name: 'notifications', route: '/(parent)/notifications', label: 'Alerts', icon: 'bell' },
  ];

  return <FloatingTabBar tabs={tabs} />;
}
