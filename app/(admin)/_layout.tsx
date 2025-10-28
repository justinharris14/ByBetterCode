
import React from 'react';
import { Slot } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function AdminLayout() {
  const tabs = [
    { name: 'dashboard', route: '/(admin)/dashboard', label: 'Home', icon: 'house' },
    { name: 'parents', route: '/(admin)/parents', label: 'Parents', icon: 'person' },
    { name: 'children', route: '/(admin)/children', label: 'Children', icon: 'people' },
    { name: 'staff', route: '/(admin)/staff', label: 'Staff', icon: 'person.badge.key' },
    { name: 'attendance', route: '/(admin)/attendance', label: 'Attendance', icon: 'check.circle' },
    { name: 'events', route: '/(admin)/events', label: 'Events', icon: 'event' },
  ];

  return (
    <>
      <Slot />
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
