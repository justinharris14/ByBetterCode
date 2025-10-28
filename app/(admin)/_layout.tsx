
import React from 'react';
import { Slot } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function AdminLayout() {
  const tabs = [
    { name: 'dashboard', route: '/(admin)/dashboard', label: 'Home', icon: 'house.fill' },
    { name: 'children', route: '/(admin)/children', label: 'Children', icon: 'figure.2.and.child.holdinghands' },
    { name: 'attendance', route: '/(admin)/attendance', label: 'Attendance', icon: 'checkmark.circle.fill' },
    { name: 'events', route: '/(admin)/events', label: 'Events', icon: 'calendar' },
    { name: 'announcements', route: '/(admin)/announcements', label: 'News', icon: 'megaphone.fill' },
  ];

  return (
    <>
      <Slot />
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
