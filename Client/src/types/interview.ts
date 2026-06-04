export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correct_idx: number;
  explanation: string;
}

export interface DSAQuestion {
  title: string;
  description: string;
  constraints: string[];
  base_code: string;
  language: string;
  solution_logic: string;
}

export interface AssessmentData {
  mcqs: MCQQuestion[];
  dsa: DSAQuestion;
}

export interface InterviewQuestionSet {
  technical: string[];
  behavioral: string[];
  scenario_based: string[];
}

export interface ScreeningResult {
  ats_result: any;
  evaluation: any;
  interview_questions: InterviewQuestionSet;
  assessment: AssessmentData;
}
