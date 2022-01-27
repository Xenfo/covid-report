interface IDialog {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export interface IStats {
  isByGrade: boolean;
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
  placeholder: string;
  classroomRegex: string;
  isByGrade: boolean;
  min: number;
}

export interface IReadMoreDialogProps extends IDialog {}

export interface IStatsDialogProps extends IDialog {}

export interface ICaseIDDialogProps extends IDialog {
  isSubmitting: boolean;
  caseId: string;
  setCaseId: (caseId: string) => void;
}
