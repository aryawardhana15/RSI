'use client';

interface XPBarProps {
  currentXP: number;
  currentLevel: number;
  levelName: string;
  levelProgress: number;
  nextLevelXP: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function XPBar({ 
  currentXP, 
  currentLevel, 
  levelName, 
  levelProgress, 
  nextLevelXP,
  size = 'md' 
}: XPBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`font-bold text-blue-600 ${textSizeClasses[size]}`}>
            Level {currentLevel}
          </span>
          <span className={`text-gray-600 ${textSizeClasses[size]}`}>
            {levelName}
          </span>
        </div>
        <span className={`text-gray-500 ${textSizeClasses[size]}`}>
          {currentXP} / {nextLevelXP} XP
        </span>
      </div>
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div
          className={`bg-gradient-to-r from-blue-500 to-purple-600 ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(levelProgress, 100)}%` }}
        >
          {size === 'lg' && (
            <div className="h-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {levelProgress}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

