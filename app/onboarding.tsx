import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { theme } from '@/src/constants/theme';

const items = [
  { no: '01', title: 'SELF', subtitle: '내가 생각하는 나', text: '태그와 짧은 문장으로 현재의 나를 정리합니다.', color: theme.colors.softPurple },
  { no: '02', title: 'MIRROR', subtitle: '남들이 생각하는 나', text: '친구들의 익명 응답을 모아 타인의 시선 속 나를 만듭니다.', color: theme.colors.softPink },
  { no: '03', title: 'IDEAL', subtitle: '내가 되고 싶은 나', text: '앞으로 가까워지고 싶은 모습과 가치관을 정리합니다.', color: theme.colors.softGold },
];

export default function Onboarding() {
  return (
    <Screen>
      <Text style={styles.kicker}>HOW IT WORKS</Text>
      <Text style={styles.title}>한 사람 안의 세 가지 시선</Text>
      <Text style={styles.description}>세 캐릭터는 같은 방에서 서로 얼마나 닮았고 다른지 보여줍니다.</Text>
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.title} style={[styles.card, { backgroundColor: item.color }]}>
            <Text style={styles.no}>{item.no}</Text>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              <Text style={styles.cardText}>{item.text}</Text>
            </View>
          </View>
        ))}
      </View>
      <PrimaryButton label="SELF부터 만들기" onPress={() => router.push('/self/form')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: theme.colors.muted, fontWeight: '800', letterSpacing: 1.4, fontSize: 11, marginTop: 8 },
  title: { marginTop: 8, color: theme.colors.text, fontSize: 30, lineHeight: 38, fontWeight: '900', letterSpacing: -0.7 },
  description: { marginTop: 10, color: theme.colors.muted, lineHeight: 22, fontSize: 15 },
  list: { marginTop: 24, marginBottom: 20 },
  card: { borderRadius: 22, padding: 18, marginBottom: 12, flexDirection: 'row' },
  no: { width: 42, fontWeight: '900', color: theme.colors.muted, fontSize: 12 },
  cardCopy: { flex: 1 },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '900' },
  subtitle: { color: theme.colors.text, fontSize: 13, fontWeight: '700', marginTop: 2 },
  cardText: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8 },
});
