
import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Admin Dashboard',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="children"
        options={{
          title: 'Manage Children',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="events"
        options={{
          title: 'Events',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="announcements"
        options={{
          title: 'Announcements',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="media"
        options={{
          title: 'Media Gallery',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="payments"
        options={{
          title: 'Payments',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
