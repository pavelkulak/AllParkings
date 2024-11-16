import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import Root from './components/ui/Root';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { refreshToken } from './redux/thunkActions';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import ProtectedRoute from './components/HOC/ProtectedRoute';
import './App.css';
import ParkingConstructor from './components/constructor/ParkingConstructor';
import CreateParkingForm from './components/parking/CreateParkingForm';
import ProfilePage from './components/pages/ProfilePage';
import { ParkingMap } from './components/parking/ParkingMap';
import ParkingOwnerPage from './components/pages/ParkingOwnerPage';
import ErrorPage from './components/pages/ErrorPage';

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
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/',
          element: (
            <ProtectedRoute isAllowed={!!user} user={null}>
              <div>Защищенная страница</div>
            </ProtectedRoute>
          ),
        },
        {
          path: '/signin',
          element: user ? <Navigate to='/' replace /> : <SignIn />,
        },
        {
          path: '/signup',
          element: user ? <Navigate to='/' replace /> : <SignUp />,
        },
        {
          path: '/profile',
          element: user ? <ProfilePage /> : <Navigate to='/' replace />,
        },
        {
          path: '/parking-constructor',
          element: (
            <ProtectedRoute
              isAllowed={!!user}
              allowedRoles={['owner', 'admin']}
              user={user}
              redirectPath='/'
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
              redirectPath='/'
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
              redirectPath='/'
            >
              <ParkingConstructor />
            </ProtectedRoute>
          ),
        },
        {
          path: '/parkings/map',
          element: <ParkingMap />,
        },
        {
          path: '/myparking',
          element: (
            <ProtectedRoute
              isAllowed={!!user}
              allowedRoles={['owner']}
              user={user}
              redirectPath='/'
            >
              <ParkingOwnerPage />
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
