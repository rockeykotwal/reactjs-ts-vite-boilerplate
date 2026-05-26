import { Link } from 'react-router-dom';
import LoginForm from '../features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
        <p className="text-sm text-gray-500">Welcome back</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="text-blue-600 font-medium hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
