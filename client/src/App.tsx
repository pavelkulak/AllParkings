import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import Root from './components/ui/Root';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { refreshToken } from "./redux/store/features/auth/authSlice";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import ProtectedRoute from "./components/HOC/ProtectedRoute";

function App() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(refreshToken());
  }, [dispatch]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  const routes = [
    {
      path: '/',
      element: <Root />,
      children: [
        {
          path: '/',
          element: (
            <ProtectedRoute isAllowed={!!user}>
              <div>Защищенная страница</div>
            </ProtectedRoute>
          ),
        },
        {
          path: '/signin',
          element: user ? <Navigate to="/" replace /> : <SignIn />,
        },
        {
          path: '/signup',
          element: user ? <Navigate to="/" replace /> : <SignUp />,
        },
      ],
    },
  ];

  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
}

export default App;
