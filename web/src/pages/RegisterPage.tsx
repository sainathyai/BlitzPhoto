/**
 * Register Page
 * 
 * User registration page with email, username, and password.
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your BlitzPhoto account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start uploading photos at Blitz Speed
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <p className="text-center text-gray-500">
            Registration form will be implemented in next PR
          </p>
        </div>
      </div>
    </div>
  );
}

