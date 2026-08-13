import React, { createContext, useContext, useMemo, useState } from 'react';
import { demoFriendResponses } from '@/src/mocks/data';
import { FriendResponse } from '@/src/types/survey';
import { Persona, PersonaScores, scoreLabels } from '@/src/types/persona';
import { createPersona } from '@/src/utils/persona';

const defaultSelf: Persona = createPersona('SELF', {
  socialEnergy: 38,
  expression: 31,
  initiative: 58,
  empathy: 84,
  stability: 48,
  execution: 55,
}, ['생각이 많다', '책임감이 강하다', '감정을 잘 숨긴다']);

const defaultIdeal: Persona = createPersona('IDEAL', {
  socialEnergy: 70,
  expression: 78,
  initiative: 86,
  empathy: 88,
  stability: 82,
  execution: 90,
}, ['먼저 행동하는 사람', '꾸준한 사람', '감정을 솔직히 표현하는 사람']);

function mirrorFromResponses(responses: FriendResponse[]): Persona | null {
  if (responses.length < 3) return null;
  const buckets: Record<keyof PersonaScores, number[]> = {
    socialEnergy: [],
    expression: [],
    initiative: [],
    empathy: [],
    stability: [],
    execution: [],
  };
  responses.forEach((response) => {
    response.answers.forEach((answer) => {
      const trait = answer.trait as keyof PersonaScores;
      if (trait in buckets) buckets[trait].push(answer.value);
    });
  });
  const scores = {} as PersonaScores;
  (Object.keys(buckets) as (keyof PersonaScores)[]).forEach((key) => {
    const values = buckets[key];
    scores[key] = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 50;
  });
  const strongest = (Object.entries(scores) as [keyof PersonaScores, number][]).sort((a, b) => b[1] - a[1])[0][0];
  return createPersona('MIRROR', scores, [scoreLabels[strongest], '친구 응답 기반', '타인의 시선']);
}

type AppContextValue = {
  self: Persona | null;
  ideal: Persona | null;
  mirror: Persona | null;
  responses: FriendResponse[];
  surveyToken: string;
  setSelf: (persona: Persona) => void;
  setIdeal: (persona: Persona) => void;
  addFriendResponse: (response: FriendResponse) => void;
  resetDemo: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [self, setSelf] = useState<Persona | null>(defaultSelf);
  const [ideal, setIdeal] = useState<Persona | null>(defaultIdeal);
  const [responses, setResponses] = useState<FriendResponse[]>(demoFriendResponses);
  const mirror = useMemo(() => mirrorFromResponses(responses), [responses]);

  const addFriendResponse = (response: FriendResponse) => {
    setResponses((prev) => [...prev, response]);
  };

  const resetDemo = () => {
    setSelf(defaultSelf);
    setIdeal(defaultIdeal);
    setResponses(demoFriendResponses);
  };

  return (
    <AppContext.Provider
      value={{
        self,
        ideal,
        mirror,
        responses,
        surveyToken: 'DEMO2026',
        setSelf,
        setIdeal,
        addFriendResponse,
        resetDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
