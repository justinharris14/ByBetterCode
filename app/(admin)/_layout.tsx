
import React from 'react';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function AdminLayout() {
  const tabs = [
    { name: 'dashboard', route: '/(admin)/dashboard', label: 'Home', icon: 'house' },
    { name: 'children', route: '/(admin)/children', label: 'Children', icon: 'people' },
    { name: 'parents', route: '/(admin)/parents', label: 'Parents', icon: 'person.2' },
    { name: 'staff', route: '/(admin)/staff', label: 'Staff', icon: 'person.badge.shield.checkmark' },
    { name: 'attendance', route: '/(admin)/attendance', label: 'Attendance', icon: 'check.circle' },
  ];

  return <FloatingTabBar tabs={tabs} />;
}
