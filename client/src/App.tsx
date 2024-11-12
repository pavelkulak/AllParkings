import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import Root from './components/ui/Root';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { refreshToken, signOut } from "./redux/thunkActions";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import ProtectedRoute from "./components/HOC/ProtectedRoute";
<<<<<<< HEAD
import "./App.css";
=======
import ParkingConstructor from "./components/constructor/ParkingConstructor";
import CreateParkingForm from "./components/parking/CreateParkingForm";

>>>>>>> dev

function App() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(refreshToken());
  }, [dispatch]);

  if (status === 'loading' || status === 'idle') {
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
        {
          path: '/parking-constructor',
          element: (
            <ProtectedRoute 
              isAllowed={!!user} 
              allowedRoles={['owner', 'admin']}
              user={user}
              redirectPath="/"
            >
              <ParkingConstructor />
            </ProtectedRoute>
          ),
        },
        {
          path: '/create-parking',
          element: (
            <ProtectedRoute 
              isAllowed={!!user} 
              allowedRoles={['owner', 'admin']}
              user={user}
              redirectPath="/"
            >
              <CreateParkingForm />
            </ProtectedRoute>
          ),
        },
        {
          path: '/parking-constructor/:parkingId',
          element: (
            <ProtectedRoute 
              isAllowed={!!user} 
              allowedRoles={['owner', 'admin']}
              user={user}
              redirectPath="/"
            >
              <ParkingConstructor />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ];

  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
}

export default App;
