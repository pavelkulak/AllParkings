import { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { signIn } from '../../redux/thunkActions';
import type { LoginCredentials } from '../../types/auth.types';

export default function SignIn() {
  const dispatch = useAppDispatch();
  const { error, isLoading } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const credentials: LoginCredentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };
    await dispatch(signIn(credentials));
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input type="email" name="email" required placeholder="Email" />
      <input type="password" name="password" required placeholder="Password" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Загрузка...' : 'Войти'}
      </button>
    </form>
  );
} 