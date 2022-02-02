import { atomWithStorage } from 'jotai/utils';

export const starredSchoolsAtom = atomWithStorage<string[]>(
  'starredSchools',
  []
);
