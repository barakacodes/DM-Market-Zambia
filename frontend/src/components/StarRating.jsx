import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function StarRating({ rating, reviewCount, size = 16 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} color="#faca15" size={size} />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} color="#faca15" size={size} />);
    } else {
      stars.push(<FaRegStar key={i} color="#9ca3af" size={size} />);
    }
  }
  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {reviewCount !== undefined && (
        <span className="text-sm text-gray-500">({reviewCount})</span>
      )}
    </div>
  );
}
