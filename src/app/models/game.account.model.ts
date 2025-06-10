export interface GameAccount {
  username: string;
  password: string;
}
export interface AccountGameResponse {
  login: string;
  email: string;
  createdTime: string; // o Date, pero generalmente viene como string ISO
  lastActive: number;  // suponiendo que es un timestamp en millis o segundos
  lastIP: string;
  lastServer: number;
  pcIp: string;
}
