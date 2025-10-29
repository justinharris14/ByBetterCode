
import React from 'react';
import { Slot } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function ParentLayout() {
  const tabs = [
    { name: 'dashboard', route: '/(parent)/dashboard', label: 'Home', icon: 'house.fill' },
    { name: 'children', route: '/(parent)/children', label: 'Children', icon: 'figure.2.and.child.holdinghands' },
    { name: 'consent', route: '/(parent)/consent', label: 'Consent', icon: 'doc.text.fill' },
    { name: 'payments', route: '/(parent)/payments', label: 'Payments', icon: 'creditcard.fill' },
    { name: 'events', route: '/(parent)/events', label: 'Events', icon: 'calendar' },
  ];

  return (
    <>
      <Slot />
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
