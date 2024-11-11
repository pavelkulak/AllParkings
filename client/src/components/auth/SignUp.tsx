import { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { signUp } from '../../redux/thunkActions';
import type { RegisterCredentials } from '../../types/auth.types';

export default function SignUp() {
  const dispatch = useAppDispatch();
  const { error, isLoading } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const credentials: RegisterCredentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      username: formData.get('username') as string,
    };
    await dispatch(signUp(credentials));
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input type="text" name="username" required placeholder="Username" />
      <input type="email" name="email" required placeholder="Email" />
      <input type="password" name="password" required placeholder="Password" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
} 