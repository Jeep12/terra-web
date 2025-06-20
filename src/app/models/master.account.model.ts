export interface AccountMaster {
  id: number;
  email: string;
  enabled: boolean;
  emailVerified: boolean;
  roles: string[];
  terraCoins: number;
  createdAt: string;  // Fecha de creación, ISO string o Date
  twoFactorEnabled: boolean;  // nuevo campo

}
