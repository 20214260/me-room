import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/src/context/AppContext';
import { theme } from '@/src/constants/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
          headerTintColor: theme.colors.text,
          contentStyle: { backgroundColor: theme.colors.background },
          headerBackTitle: '뒤로',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="self/form" options={{ title: 'SELF 만들기' }} />
        <Stack.Screen name="self/result" options={{ title: 'SELF 결과' }} />
        <Stack.Screen name="ideal/form" options={{ title: 'IDEAL 만들기' }} />
        <Stack.Screen name="ideal/result" options={{ title: 'IDEAL 결과' }} />
        <Stack.Screen name="room/index" options={{ title: 'ME:ROOM' }} />
        <Stack.Screen name="mirror/invite" options={{ title: 'MIRROR 초대' }} />
        <Stack.Screen name="mirror/result" options={{ title: 'MIRROR 결과' }} />
        <Stack.Screen name="compare/index" options={{ title: '세 가지 나 비교' }} />
        <Stack.Screen name="daily/index" options={{ title: '오늘의 한 조각' }} />
        <Stack.Screen name="survey/[token]" options={{ title: '친구가 보는 나' }} />
      </Stack>
    </AppProvider>
  );
}
