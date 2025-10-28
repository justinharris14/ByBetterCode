
import React from 'react';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function AdminLayout() {
  const tabs = [
    { route: '/(admin)/dashboard', label: 'Home', icon: 'house' },
    { route: '/(admin)/children', label: 'Children', icon: 'people' },
    { route: '/(admin)/parents', label: 'Parents', icon: 'person.2' },
    { route: '/(admin)/staff', label: 'Staff', icon: 'person.badge.shield.checkmark' },
    { route: '/(admin)/attendance', label: 'Attendance', icon: 'check.circle' },
  ];

  return <FloatingTabBar tabs={tabs} />;
}
