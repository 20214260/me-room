export type SurveyAnswer = {
  questionId: string;
  trait: string;
  value: number;
  label: string;
};

export type FriendResponse = {
  id: string;
  answers: SurveyAnswer[];
  comment?: string;
};
