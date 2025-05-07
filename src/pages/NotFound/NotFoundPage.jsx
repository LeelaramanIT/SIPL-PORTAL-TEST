import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-5">
            <h1 className="text-9xl font-bold text-blue-600">404</h1>
            <h2 className="text-3xl font-semibold mt-4">Oops! Page Not Found</h2>
            <p className="text-lg text-gray-600 mt-2">The page you're looking for doesn't exist or has been moved.</p>
            <Link to="/">
                <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
                    Go Back Home
                </button>
            </Link>
        </div>
    );
}
