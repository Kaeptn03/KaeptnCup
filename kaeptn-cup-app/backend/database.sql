-- Tournament Management App Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    invite_code VARCHAR(50) UNIQUE,
    invited_by INTEGER REFERENCES users(id),
    is_admin BOOLEAN DEFAULT FALSE,
    elo_rating INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invitation Codes Table
CREATE TABLE IF NOT EXISTS invitation_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_by INTEGER REFERENCES users(id),
    used_by INTEGER REFERENCES users(id),
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP
);

-- Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tournament_type VARCHAR(50) NOT NULL, -- 'single_elimination', 'double_elimination', 'round_robin', 'swiss'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    max_participants INTEGER DEFAULT 32,
    current_participants INTEGER DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament Participants Table
CREATE TABLE IF NOT EXISTS tournament_participants (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    seed INTEGER,
    status VARCHAR(50) DEFAULT 'registered', -- 'registered', 'checked_in', 'eliminated', 'winner'
    final_position INTEGER,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, user_id)
);

-- Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    bracket_type VARCHAR(50) DEFAULT 'winners', -- 'winners', 'losers', 'finals'
    player1_id INTEGER REFERENCES users(id),
    player2_id INTEGER REFERENCES users(id),
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    winner_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    scheduled_time TIMESTAMP,
    completed_at TIMESTAMP,
    next_match_id INTEGER REFERENCES matches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rankings Table
CREATE TABLE IF NOT EXISTS rankings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    total_tournaments INTEGER DEFAULT 0,
    tournaments_won INTEGER DEFAULT 0,
    total_matches INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    elo_rating INTEGER DEFAULT 1000,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Twitch Streams Table
CREATE TABLE IF NOT EXISTS twitch_streams (
    id SERIAL PRIMARY KEY,
    channel_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    order_position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News Table
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'meta' or 'patch_notes'
    title VARCHAR(255) NOT NULL,
    content TEXT, -- For meta: description, for patch_notes: not used
    url TEXT, -- For patch_notes: the URL to embed, for meta: not used
    image_url TEXT, -- For meta: the image URL, for patch_notes: not used
    created_by INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brackets Table
CREATE TABLE IF NOT EXISTS brackets (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    challonge_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id)
);

-- Insert default Twitch streams
INSERT INTO twitch_streams (channel_name, display_name, is_active, order_position)
VALUES ('kaeptn03', 'Kaeptn03', true, 1)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_rankings_elo ON rankings(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_rankings_points ON rankings(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_brackets_tournament ON brackets(tournament_id);
