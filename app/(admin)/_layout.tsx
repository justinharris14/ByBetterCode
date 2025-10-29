
import React from 'react';
import { Slot } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function AdminLayout() {
  const tabs = [
    { name: 'dashboard', route: '/(admin)/dashboard', label: 'Home', icon: 'house.fill' },
    { name: 'children', route: '/(admin)/children', label: 'Children', icon: 'figure.2.and.child.holdinghands' },
    { name: 'consent', route: '/(admin)/consent', label: 'Consent', icon: 'doc.text.fill' },
    { name: 'payments', route: '/(admin)/payments', label: 'Payments', icon: 'creditcard.fill' },
    { name: 'events', route: '/(admin)/events', label: 'Events', icon: 'calendar' },
  ];

  return (
    <>
      <Slot />
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
