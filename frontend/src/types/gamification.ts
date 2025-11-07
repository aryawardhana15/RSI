export interface UserStats {
  total_xp: number;
  current_level: number;
  level_name: string;
  level_progress: number;
  next_level_xp: number;
  total_badges: number;
  completed_missions: number;
  rank: number;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  photo_url?: string;
  total_xp: number;
  current_level: number;
  level_name: string;
  total_badges: number;
  courses_completed: number;
  rank: number;
}

export interface Badge {
  badge_id: number;
  badge_name: string;
  description: string;
  icon_url?: string;
  requirement: string;
  earned: boolean;
  earned_at?: string;
}

export interface Mission {
  mission_id: number;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement';
  requirement_type: string;
  requirement_count: number;
  current_progress: number;
  xp_reward: number;
  badge_reward?: number;
  is_completed: boolean;
  completed_at?: string;
  reset_at?: string;
  progress_percentage: number;
}

export interface XPHistory {
  id: number;
  user_id: number;
  xp_amount: number;
  reason: string;
  created_at: string;
}

