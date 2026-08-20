import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { FriendResponse } from '@/src/types/survey';
import { Persona } from '@/src/types/persona';

import { createPersona } from '@/src/utils/persona';
import { loadPersona } from '@/src/services/personaService';
import { supabase } from '@/src/services/supabase';

const defaultSelf: Persona = createPersona(
  'SELF',
  {
    socialEnergy: 38,
    expression: 31,
    initiative: 58,
    empathy: 84,
    stability: 48,
    execution: 55,
  },
  ['생각이 많다', '책임감이 강하다', '감정을 잘 숨긴다'],
);

const defaultIdeal: Persona = createPersona(
  'IDEAL',
  {
    socialEnergy: 70,
    expression: 78,
    initiative: 86,
    empathy: 88,
    stability: 82,
    execution: 90,
  },
  ['먼저 행동하는 사람', '꾸준한 사람', '감정을 솔직히 표현하는 사람'],
);

type AppContextValue = {
  self: Persona | null;
  ideal: Persona | null;
  mirror: Persona | null;

  responses: FriendResponse[];
  surveyToken: string;

  setSelf: (persona: Persona) => void;
  setIdeal: (persona: Persona) => void;

  refreshPersonas: () => Promise<void>;
  refreshMirror: () => Promise<Persona | null>;
  addFriendResponse: (response: FriendResponse) => void;
  resetDemo: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [self, setSelf] = useState<Persona | null>(null);
  const [ideal, setIdeal] = useState<Persona | null>(null);

  // MIRROR는 실제 DB personas 테이블에 존재할 때만 입주한다.
  const [mirror, setMirror] = useState<Persona | null>(null);

  // 기존 화면 흐름 호환용 로컬 응답 목록. 실제 MIRROR의 기준은 DB 응답이다.
  const [responses, setResponses] = useState<FriendResponse[]>([]);

  const loadSavedPersonas = useCallback(async (userId: string) => {
    const [savedSelf, savedIdeal, savedMirror] = await Promise.all([
      loadPersona(userId, 'SELF'),
      loadPersona(userId, 'IDEAL'),
      loadPersona(userId, 'MIRROR'),
    ]);

    setSelf(savedSelf);
    setIdeal(savedIdeal);
    setMirror(savedMirror);
  }, []);

  const refreshPersonas = useCallback(async () => {
    if (!supabase) return;

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return;
      await loadSavedPersonas(user.id);
    } catch (error) {
      console.error('저장된 Persona 새로고침 실패:', error);
    }
  }, [loadSavedPersonas]);

  const refreshMirror = useCallback(async () => {
    if (!supabase) return null;

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return null;

      const savedMirror = await loadPersona(user.id, 'MIRROR');
      setMirror(savedMirror);
      return savedMirror;
    } catch (error) {
      console.error('MIRROR 새로고침 실패:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;

      if (user) {
        loadSavedPersonas(user.id).catch((error) => {
          console.error('저장된 Persona 불러오기 실패:', error);
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadSavedPersonas(session.user.id).catch((error) => {
          console.error('저장된 Persona 불러오기 실패:', error);
        });
      } else {
        setSelf(null);
        setIdeal(null);
        setMirror(null);
        setResponses([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadSavedPersonas]);

  const addFriendResponse = (response: FriendResponse) => {
    setResponses((prev) => [...prev, response]);
  };

  const resetDemo = () => {
    setSelf(defaultSelf);
    setIdeal(defaultIdeal);
    setMirror(null);
    setResponses([]);
  };

  return (
    <AppContext.Provider
      value={{
        self,
        ideal,
        mirror,
        responses,
        surveyToken: '',
        setSelf,
        setIdeal,
        refreshPersonas,
        refreshMirror,
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

  if (!value) {
    throw new Error('useApp must be used inside AppProvider');
  }

  return value;
}
