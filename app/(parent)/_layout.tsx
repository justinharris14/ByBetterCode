
import React from 'react';
import { Slot } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function ParentLayout() {
  const tabs = [
    { name: 'dashboard', route: '/(parent)/dashboard', label: 'Home', icon: 'house' },
    { name: 'children', route: '/(parent)/children', label: 'Children', icon: 'people' },
    { name: 'attendance', route: '/(parent)/attendance', label: 'Attendance', icon: 'check.circle' },
    { name: 'events', route: '/(parent)/events', label: 'Events', icon: 'event' },
    { name: 'announcements', route: '/(parent)/announcements', label: 'News', icon: 'megaphone' },
  ];

  return (
    <>
      <Slot />
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
