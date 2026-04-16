interface IAuthService {
  signOut(): Promise<void>;
}

const AuthService: IAuthService = {
  async signOut() {
    return Promise.resolve();
  },
};

export { AuthService };
