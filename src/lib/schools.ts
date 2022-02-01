import { ISchool } from '../typings';

export const schools: ISchool[] = [
  {
    alias: 'PDC',
    name: 'Pierre de Coubertin Elementary School',
    placeholder: 'Classroom Number',
    classroomRegex: '(^PK[1-2]$)|(^K0[1-3]$)|(^[1-6]0[1-3]$)',
    type: 'normal',
    min: 3
  },
  {
    alias: 'PET',
    name: 'Pierre Elliott Trudeau Elementary School',
    placeholder: 'Classroom Number',
    classroomRegex: '(^[1-2][0-1][0-9]$)',
    type: 'normal',
    min: 3
  },
  {
    alias: 'DG',
    name: 'Dunrae Gardens Elementary School',
    placeholder: 'Classroom Number',
    classroomRegex: '(^[1-3][0-7]$)',
    type: 'normal',
    min: 2
  },
  {
    alias: 'EH',
    name: 'East Hill Elementary School',
    placeholder: 'Classroom Number',
    classroomRegex: '(^1/2C$)|(^[1-6KP][A-D]$)',
    type: 'normal',
    min: 2
  },
  {
    alias: 'D',
    name: 'Dante Elementary School',
    placeholder: 'Classroom Number',
    classroomRegex: '(^K-01[1-2]$)|(^1S2$)|(^[0-6]0[1-3]$)',
    type: 'normal',
    min: 3
  },
  {
    alias: 'CE',
    name: 'Cedarcrest Elementary School',
    placeholder: 'Classroom Number',
    classroomRegex: '(^K[A-B]$)|(^[1-6][A-C]$)|(^3C4$)|(^5C/6$)',
    type: 'normal',
    min: 2
  },
  {
    alias: 'CA',
    name: 'Carlyle Elementary School',
    placeholder: 'Classroom Number',
    classroomRegex: '(^B-[0-1][1-6]$)|(^[1-2][0-1][0-8]$)',
    type: 'normal',
    min: 3
  },
  {
    alias: 'B',
    name: 'Bancroft Elementary School',
    placeholder: 'Classroom Number',
    classroomRegex:
      '(^Pre-K[1-2]$)|(^K[1-3]$)|(^[1-4][A-C]$)|(^[5-6]$)|(^3/4$)|(^5/6$)',
    type: 'normal',
    min: 1
  },
  {
    alias: 'WP',
    name: 'Westmount Park School',
    placeholder: 'Classroom Number',
    classroomRegex: '(^[0-9]{3}$)',
    type: 'normal',
    min: 3
  },
  {
    alias: 'MC',
    name: 'Mackay Centre School',
    placeholder: 'Grade Level',
    classroomRegex: '(^Pre-K$)|(^K$)|(^[1-6]$)',
    type: 'grade',
    min: 1
  },
  {
    alias: 'P',
    name: 'Parkdale Elementary School',
    placeholder: 'Room Number',
    classroomRegex: '(^[0-9]{1,2}$)',
    type: 'room',
    min: 1
  },
  {
    alias: 'M',
    name: 'Merton Elementary School',
    placeholder: 'Room Number',
    classroomRegex: '(^[0-9]{1,2}$)',
    type: 'room',
    min: 1
  },
  {
    alias: 'LDVA',
    name: 'Leonardo DaVinci Academy',
    placeholder: 'Classroom Number',
    classroomRegex: '(^PK[A-C]$)|(^K[A-C]$)|(^[1-6][A-Z]$)',
    type: 'normal',
    min: 2
  }
];
