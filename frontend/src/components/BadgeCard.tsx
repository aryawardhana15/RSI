import { Badge } from '@/types/gamification';

interface BadgeCardProps {
  badge: Badge;
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`relative rounded-lg p-4 border-2 transition-all ${
        badge.earned
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-lg'
          : 'bg-gray-100 border-gray-300 opacity-60'
      }`}
    >
      {/* Badge Icon/Image */}
      <div className="flex justify-center mb-3">
        {badge.icon_url ? (
          <img
            src={badge.icon_url}
            alt={badge.badge_name}
            className={`w-16 h-16 ${!badge.earned && 'grayscale'}`}
          />
        ) : (
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              badge.earned
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                : 'bg-gray-300'
            }`}
          >
            <svg
              className={`w-8 h-8 ${badge.earned ? 'text-white' : 'text-gray-500'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h3 className={`font-bold mb-1 ${badge.earned ? 'text-gray-900' : 'text-gray-600'}`}>
          {badge.badge_name}
        </h3>
        <p className={`text-xs mb-2 ${badge.earned ? 'text-gray-700' : 'text-gray-500'}`}>
          {badge.description}
        </p>
        <p className="text-xs text-gray-500 italic">
          {badge.requirement}
        </p>
        {badge.earned && badge.earned_at && (
          <p className="text-xs text-green-600 font-medium mt-2">
            Didapat: {formatDate(badge.earned_at)}
          </p>
        )}
      </div>

      {/* Lock Icon */}
      {!badge.earned && (
        <div className="absolute top-2 right-2">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

