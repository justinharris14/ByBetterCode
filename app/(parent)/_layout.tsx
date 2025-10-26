
import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function ParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.secondary,
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
          title: 'Parent Dashboard',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="children"
        options={{
          title: 'My Children',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="attendance"
        options={{
          title: 'Attendance History',
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
        name="payments"
        options={{
          title: 'Payments',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="media"
        options={{
          title: 'Photos & Videos',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
