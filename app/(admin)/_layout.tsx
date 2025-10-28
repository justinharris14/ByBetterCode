
import React from 'react';
import { Slot } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function AdminLayout() {
  const tabs = [
    { name: 'dashboard', route: '/(admin)/dashboard', label: 'Home', icon: 'house' },
    { name: 'children', route: '/(admin)/children', label: 'Children', icon: 'people' },
    { name: 'attendance', route: '/(admin)/attendance', label: 'Attendance', icon: 'check.circle' },
    { name: 'events', route: '/(admin)/events', label: 'Events', icon: 'event' },
    { name: 'announcements', route: '/(admin)/announcements', label: 'News', icon: 'megaphone' },
  ];

  return (
    <>
      <Slot />
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
