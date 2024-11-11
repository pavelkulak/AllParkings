import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { signOut } from '../../redux/store/features/auth/authSlice';
import NavBar from './NavBar';
import { Outlet } from 'react-router-dom';

export default function Root() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleSignOut = () => {
    dispatch(signOut());
  };

  return (
    <>
      <NavBar user={user} handleSignOut={handleSignOut} />
      <Outlet />
    </>
  );
}
