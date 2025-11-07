import { Mission } from '@/types/gamification';

interface MissionCardProps {
  mission: Mission;
}

export default function MissionCard({ mission }: MissionCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-purple-100 text-purple-800';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'daily':
        return 'Harian';
      case 'weekly':
        return 'Mingguan';
      case 'achievement':
        return 'Pencapaian';
      default:
        return type;
    }
  };

  return (
    <div
      className={`rounded-lg p-4 border-2 transition-all ${
        mission.is_completed
          ? 'bg-green-50 border-green-400'
          : 'bg-white border-gray-200 hover:border-blue-400'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(mission.type)}`}>
              {getTypeLabel(mission.type)}
            </span>
            {!!mission.is_completed && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Selesai ✓
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 mb-1">{mission.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{mission.description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {!mission.is_completed ? (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">
              {mission.current_progress} / {mission.requirement_count}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(mission.progress_percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      ) : null}

      {/* Reward */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">+{mission.xp_reward} XP</span>
        </div>
        {mission.badge_reward && (
          <div className="flex items-center space-x-1 text-orange-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium">Badge</span>
          </div>
        )}
      </div>

      {/* Reset Info */}
      {mission.reset_at && !mission.is_completed ? (
        <p className="text-xs text-gray-500 mt-2">
          Reset: {new Date(mission.reset_at).toLocaleDateString('id-ID')}
        </p>
      ) : null}
    </div>
  );
}

