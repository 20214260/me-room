import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '@/src/constants/theme';

export default function NotFound() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>페이지를 찾을 수 없습니다.</Text>
      <Link href="/" style={styles.link}>처음으로 돌아가기</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, padding: 24 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '900' },
  link: { marginTop: 14, color: theme.colors.self, fontWeight: '800' },
});
