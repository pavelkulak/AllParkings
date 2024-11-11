import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({
  children,
  isAllowed,
  redirectPath = '/',
}: {
  children?: React.ReactNode;
  isAllowed: boolean;
  redirectPath?: string;
}) {
  if (!isAllowed) return <Navigate to={redirectPath} replace />;
  return children || <Outlet />;
}
