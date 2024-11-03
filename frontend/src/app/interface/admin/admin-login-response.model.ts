export interface AdminLoginResponse {
    status: number;
    isSuccessful: boolean;
    result: {
      token: string;
      id: string;
      username: string;
      emailAddress: string;
    };
  }