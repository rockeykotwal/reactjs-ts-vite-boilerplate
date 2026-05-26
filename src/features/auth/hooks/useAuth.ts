import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser, logoutUser } from '../../../api/auth.api';
import { useAuthStore } from '../../../store/auth.store';

export function useLogin() {
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: (response) => {
      const token = response.data.accessToken;
      setToken(token);
      localStorage.setItem('accessToken', token);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => registerUser(name, email, password),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => logout(),
  });
}
