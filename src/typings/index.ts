import { ButtonHTMLAttributes } from 'react';

export type ISchoolServer = Omit<ISchool, 'starred'>;

export type IButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export interface IStats {
  cases: { class: string; cases: { amount: number; when: string }[] }[];
}

interface IDialog {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export interface ISchoolSelectionProps {
  selectedSchool: ISchool;
  setSelectedSchool: (selectedSchool: ISchool) => void;
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
  type: 'normal' | 'grade' | 'room';
  min: number;
  starred: boolean;
}

export interface IReadMoreDialogProps extends IDialog {}

export interface IStatsDialogProps extends IDialog {}

export interface ICaseIDDialogProps extends IDialog {
  isSubmitting: boolean;
  caseId: string;
  setCaseId: (caseId: string) => void;
}
