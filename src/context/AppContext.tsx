import React, {
  createContext,
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

  addFriendResponse: (response: FriendResponse) => void;
  resetDemo: () => void;
};


const AppContext =
  createContext<AppContextValue | null>(null);


export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [self, setSelf] = useState<Persona | null>(null);
  const [ideal, setIdeal] = useState<Persona | null>(null);

  // MIRROR는 더 이상 Mock 응답으로 생성하지 않음.
  // 실제 DB personas 테이블에 MIRROR가 저장되어 있을 때만 불러옴.
  const [mirror, setMirror] = useState<Persona | null>(null);

  // 기존 코드 호환을 위해 responses는 남겨두되
  // Mock Data로 시작하지 않음.
  const [responses, setResponses] =
    useState<FriendResponse[]>([]);


  useEffect(() => {
    if (!supabase) return;

    const loadSavedPersonas = async (userId: string) => {
      try {
        const [
          savedSelf,
          savedIdeal,
          savedMirror,
        ] = await Promise.all([
          loadPersona(userId, 'SELF'),
          loadPersona(userId, 'IDEAL'),
          loadPersona(userId, 'MIRROR'),
        ]);

        setSelf(savedSelf);
        setIdeal(savedIdeal);
        setMirror(savedMirror);
      } catch (error) {
        console.error(
          '저장된 Persona 불러오기 실패:',
          error,
        );
      }
    };


    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;

      if (user) {
        loadSavedPersonas(user.id);
      }
    });


    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadSavedPersonas(session.user.id);
        } else {
          setSelf(null);
          setIdeal(null);
          setMirror(null);
          setResponses([]);
        }
      },
    );


    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const addFriendResponse = (
    response: FriendResponse,
  ) => {
    setResponses((prev) => [
      ...prev,
      response,
    ]);
  };


  const resetDemo = () => {
    setSelf(defaultSelf);
    setIdeal(defaultIdeal);

    // MIRROR는 실제 친구 응답 3개 이상 + 분석 후 생성되어야 함.
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

        // 기존 파일 호환용.
        // 실제 설문 토큰은 invite.tsx에서 Supabase 데이터를 사용함.
        surveyToken: '',

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

  if (!value) {
    throw new Error(
      'useApp must be used inside AppProvider',
    );
  }

  return value;
}