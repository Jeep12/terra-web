export interface AccountMaster {
  id: number;
  email: string;
  enabled: boolean;
  emailVerified: boolean;
  roles: string[];
  terraCoins: number;
  createdAt: string;  
  twoFactorEnabled: boolean; 
  googleUid:string

}
