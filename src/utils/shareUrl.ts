import { Platform } from 'react-native';

export function buildSurveyShareUrl(token: string) {
  const configured = process.env.EXPO_PUBLIC_APP_URL?.trim().replace(/\/$/, '');

  if (configured) {
    return `${configured}/survey/${token}`;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/survey/${token}`;
  }

  return `meroom://survey/${token}`;
}
