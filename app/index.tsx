import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { PersonaAvatar } from '@/src/components/PersonaAvatar';
import { theme } from '@/src/constants/theme';

export default function Home() {
  return (
    <Screen scroll={false}>
      <View style={styles.top}>
        <Text style={styles.logo}>ME:ROOM</Text>
        <Text style={styles.kicker}>THREE VERSIONS OF ME</Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.avatarRow}>
          <PersonaAvatar type="SELF" size={82} />
          <PersonaAvatar type="MIRROR" size={82} locked />
          <PersonaAvatar type="IDEAL" size={82} />
        </View>
        <Text style={styles.title}>내 안의 세 사람이{`\n`}한 방에 산다면?</Text>
        <Text style={styles.description}>
          내가 보는 나, 남들이 보는 나, 되고 싶은 나를 캐릭터로 만들고 서로의 거리를 확인해보세요.
        </Text>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton label="세 명의 나 만나기" onPress={() => router.push('/onboarding')} />
        <Text style={styles.demo}>현재 버전은 프론트 시연용 Mock Data가 포함되어 있습니다.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 10 },
  logo: { fontSize: 20, fontWeight: '900', letterSpacing: -0.4, color: theme.colors.text },
  kicker: { marginTop: 3, fontSize: 10, letterSpacing: 1.8, color: theme.colors.muted, fontWeight: '700' },
  hero: { flex: 1, justifyContent: 'center' },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 36, lineHeight: 45, letterSpacing: -1.2, color: theme.colors.text, fontWeight: '900' },
  description: { marginTop: 18, fontSize: 16, lineHeight: 25, color: theme.colors.muted },
  bottom: { paddingBottom: 8 },
  demo: { textAlign: 'center', color: theme.colors.muted, fontSize: 11, marginTop: 12 },
});
