export interface User {
  id: number;
  username: string;
  email: string;
  invite_code: string;
  elo_rating: number;
  is_admin?: boolean;
  rank?: number;
}

export interface Tournament {
  id: number;
  name: string;
  description?: string;
  tournament_type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  status: 'pending' | 'in_progress' | 'completed';
  max_participants: number;
  current_participants: number;
  participant_count?: number;
  start_date?: string;
  end_date?: string;
  created_by: number;
  creator_name?: string;
  participants?: Participant[];
  created_at: string;
  entry_fee?: string;
  paypal_email?: string;
  max_rank?: number;
  is_registration_open?: boolean;
}

export interface Participant {
  id: number;
  tournament_id: number;
  user_id: number;
  username: string;
  seed: number;
  status: string;
  final_position?: number;
  points_earned: number;
  elo_rating: number;
}

export interface Match {
  id: number;
  tournament_id: number;
  round: number;
  match_number: number;
  bracket_type: 'winners' | 'losers' | 'finals';
  player1_id?: number;
  player2_id?: number;
  player1_name?: string;
  player2_name?: string;
  player1_score: number;
  player2_score: number;
  winner_id?: number;
  winner_name?: string;
  status: 'pending' | 'in_progress' | 'completed';
  scheduled_time?: string;
  completed_at?: string;
}

export interface Ranking {
  id: number;
  user_id: number;
  username: string;
  total_tournaments: number;
  tournaments_won: number;
  total_matches: number;
  matches_won: number;
  current_streak: number;
  best_streak: number;
  total_points: number;
  elo_rating: number;
  rank?: number;
}

export interface TwitchStream {
  id: number;
  channel_name: string;
  display_name: string;
  is_active: boolean;
  order_position: number;
}

export interface Bracket {
  id: number;
  tournament_id: number;
  tournament_name?: string;
  tournament_status?: string;
  challonge_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
