function generateSingleEliminationBracket(participants, tournamentId) {
  const matches = [];
  const playerCount = participants.length;
  const rounds = Math.ceil(Math.log2(playerCount));
  const totalSlots = Math.pow(2, rounds);
  
  const seeds = [];
  for (let i = 0; i < totalSlots; i++) {
    seeds.push(participants[i] || null);
  }

  let matchNumber = 1;
  let currentRound = 1;
  let currentMatches = [];

  for (let i = 0; i < seeds.length; i += 2) {
    currentMatches.push({
      tournament_id: tournamentId,
      round: currentRound,
      match_number: matchNumber++,
      bracket_type: 'winners',
      player1_id: seeds[i]?.user_id || null,
      player2_id: seeds[i + 1]?.user_id || null,
      status: (seeds[i] && seeds[i + 1]) ? 'pending' : 'completed',
      winner_id: (!seeds[i] && seeds[i + 1]) ? seeds[i + 1].user_id : 
                 (seeds[i] && !seeds[i + 1]) ? seeds[i].user_id : null
    });
  }

  matches.push(...currentMatches);

  for (let round = 2; round <= rounds; round++) {
    const previousMatches = currentMatches;
    currentMatches = [];

    for (let i = 0; i < previousMatches.length; i += 2) {
      currentMatches.push({
        tournament_id: tournamentId,
        round: round,
        match_number: matchNumber++,
        bracket_type: round === rounds ? 'finals' : 'winners',
        player1_id: null,
        player2_id: null,
        status: 'pending'
      });
    }

    matches.push(...currentMatches);
  }

  return matches;
}

function generateDoubleEliminationBracket(participants, tournamentId) {
  const matches = [];
  const playerCount = participants.length;
  const rounds = Math.ceil(Math.log2(playerCount));
  
  const winnersMatches = generateSingleEliminationBracket(participants, tournamentId);
  matches.push(...winnersMatches);

  const loserRounds = (rounds - 1) * 2;
  let matchNumber = winnersMatches.length + 1;

  for (let round = 1; round <= loserRounds; round++) {
    const matchesInRound = Math.floor(playerCount / Math.pow(2, Math.ceil(round / 2) + 1));
    
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        tournament_id: tournamentId,
        round: round,
        match_number: matchNumber++,
        bracket_type: 'losers',
        player1_id: null,
        player2_id: null,
        status: 'pending'
      });
    }
  }

  matches.push({
    tournament_id: tournamentId,
    round: rounds + loserRounds,
    match_number: matchNumber++,
    bracket_type: 'finals',
    player1_id: null,
    player2_id: null,
    status: 'pending'
  });

  return matches;
}

function generateRoundRobinMatches(participants, tournamentId) {
  const matches = [];
  let matchNumber = 1;

  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      matches.push({
        tournament_id: tournamentId,
        round: 1,
        match_number: matchNumber++,
        bracket_type: 'winners',
        player1_id: participants[i].user_id,
        player2_id: participants[j].user_id,
        status: 'pending'
      });
    }
  }

  return matches;
}

function generateSwissBracket(participants, tournamentId, rounds = 5) {
  const matches = [];
  let matchNumber = 1;

  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < participants.length; i += 2) {
      if (i + 1 < participants.length) {
        matches.push({
          tournament_id: tournamentId,
          round: round,
          match_number: matchNumber++,
          bracket_type: 'winners',
          player1_id: participants[i]?.user_id || null,
          player2_id: participants[i + 1]?.user_id || null,
          status: 'pending'
        });
      }
    }
  }

  return matches;
}

function generateBracket(tournamentType, participants, tournamentId) {
  switch (tournamentType) {
    case 'single_elimination':
      return generateSingleEliminationBracket(participants, tournamentId);
    case 'double_elimination':
      return generateDoubleEliminationBracket(participants, tournamentId);
    case 'round_robin':
      return generateRoundRobinMatches(participants, tournamentId);
    case 'swiss':
      return generateSwissBracket(participants, tournamentId);
    default:
      throw new Error('Invalid tournament type');
  }
}

module.exports = { generateBracket };
