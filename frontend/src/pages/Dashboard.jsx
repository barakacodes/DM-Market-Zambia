import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.email}</h1>
      <p className="mb-4">Your role: {user?.role}</p>
      <button
        onClick={() => dispatch(logout())}
        className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
