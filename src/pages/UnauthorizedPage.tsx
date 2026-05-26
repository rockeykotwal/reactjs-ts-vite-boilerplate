import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
      <p className="text-gray-500">
        You don&apos;t have permission to view this page.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline"
      >
        Go back
      </button>
    </div>
  );
}
