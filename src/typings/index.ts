export interface IStats {
  cases: { class: string; cases: { amount: number; when: string }[] }[];
}

export interface ICase {
  date: string;
  school: string;
  classroomNumber: string;
}

export interface ISchool {
  name: string;
  alias: string;
  classroomRegex: string;
}

export interface IStatsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export interface ICaseIDDialogProps {
  isSubmitting: boolean;
  caseId: string;
  setCaseId: (caseId: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
