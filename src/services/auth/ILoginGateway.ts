export interface LoginCredentials {
  email: string;
  password: string;
}

/** Point d’extension pour brancher l’API réelle sans coupler l’écran. */
export interface ILoginGateway {
  signIn(credentials: LoginCredentials): Promise<{ accessToken: string }>;
}
