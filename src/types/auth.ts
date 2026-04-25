export type Role = 'admin' | 'sdm' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface Session {
  id: string;
  name: string;
  email: string;
  role: Role;
}
