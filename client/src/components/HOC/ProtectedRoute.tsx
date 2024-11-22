import { Navigate, Outlet } from 'react-router-dom';
import { IUser } from '../../types/auth.types';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  isAllowed: boolean;
  redirectPath?: string;
  allowedRoles?: Array<'user' | 'owner' | 'admin'>;
  user: IUser | null;
}

export default function ProtectedRoute({
  children,
  isAllowed,
  redirectPath = '/signin',
  allowedRoles,
  user
}: ProtectedRouteProps) {
  console.log('Protected Route Debug:', {
    isAllowed,
    allowedRoles,
    userRole: user?.role,
    isAuthorized: isAllowed && (!allowedRoles || (user && allowedRoles.includes(user.role))),
    user: user
  });

  const isAuthorized = isAllowed && (!allowedRoles || (user && allowedRoles.includes(user.role)));

  if (!isAuthorized) {
    console.log('Access denied, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  return children || <Outlet />;
}
