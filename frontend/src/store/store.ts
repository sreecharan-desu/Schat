import { atom } from 'recoil';

export interface User {
  name: string;
  email: string;
}

export const userAtom = atom<User | null>({
  key: 'userAtom',
  default: null,
});