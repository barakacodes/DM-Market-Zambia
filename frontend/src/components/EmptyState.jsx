import { Link } from 'react-router-dom';

export default function EmptyState({ title, message, actionText, actionLink }) {
  return (
    <div className="text-center py-16 px-4">
      <h2 className="text-xl font-semibold text-gray-600 mb-2">{title}</h2>
      <p className="text-gray-400 mb-4">{message}</p>
      {actionLink && (
        <Link to={actionLink} className="text-indigo-600 hover:underline font-medium">
          {actionText}
        </Link>
      )}
    </div>
  );
}
