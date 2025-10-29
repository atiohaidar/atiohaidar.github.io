export interface ProfileFormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormData, string>>;
