import { apiClient } from './apiClient';

export interface User {
  id: number;
  name: string;
  email: string;
}

export type ApiDataResponse<TData> = {
  data: TData;
};

export type ApiMessageResponse = {
  message: string;
};

export type AuthUserData = {
  user: User;
};

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export type UpdateUserPayload =
  | { name: string; email?: string }
  | { name?: string; email: string };

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type AuthUserResponse = ApiDataResponse<AuthUserData>;
export type LogoutResponse = ApiMessageResponse;
export type UpdatePasswordResponse = ApiMessageResponse;
export type ForgotPasswordResponse = ApiMessageResponse;
export type ResetPasswordResponse = ApiMessageResponse;

// Creates a user account and returns the new user.
export const registerUser = (payload: RegisterUserPayload) =>
  apiClient.post<AuthUserResponse>('/auth/register', payload);

// Logs in and lets the browser keep the auth cookie.
export const loginUser = (payload: LoginUserPayload) =>
  apiClient.post<AuthUserResponse>('/auth/login', payload);

// Clears the auth cookie on the backend.
export const logoutUser = () => apiClient.post<LogoutResponse>('/auth/logout');

// Checks whether the current auth cookie still belongs to a user.
export const getCurrentUser = () => apiClient.get<AuthUserResponse>('/auth/me');

// Updates the current user's profile fields.
export const updateUser = (payload: UpdateUserPayload) =>
  apiClient.patch<AuthUserResponse>('/auth/me', payload);

// Deletes the account associated with the current auth cookie.
export const deleteUser = () => apiClient.delete<AuthUserResponse>('/auth/me');

// Updates the current user's password.
export const updatePassword = (payload: UpdatePasswordPayload) =>
  apiClient.patch<UpdatePasswordResponse>('/auth/password', payload);

// Sends a password reset email when an account exists for the email.
export const forgotPassword = (payload: ForgotPasswordPayload) =>
  apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', payload);

// Resets the user's password with a reset token.
export const resetPassword = (payload: ResetPasswordPayload) =>
  apiClient.post<ResetPasswordResponse>('/auth/reset-password', payload);

export const authService = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUser,
  deleteUser,
  updatePassword,
  forgotPassword,
  resetPassword,
};
