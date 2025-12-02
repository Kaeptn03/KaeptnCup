import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { rankingsAPI } from '../services/api';
import { Ranking } from '../types';
import { theme } from '../theme/colors';

export default function RankingsScreen() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRankings = async () => {
    try {
      const response = await rankingsAPI.getAll();
      setRankings(response.data);
    } catch (error) {
      console.error('Error loading rankings:', error);
    }
  };

  useEffect(() => {
    loadRankings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRankings();
    setRefreshing(false);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankColor = (index: number) => {
    if (index < 3) return theme.colors.primary;
    return theme.colors.textSecondary;
  };

  const renderRanking = ({ item, index }: { item: Ranking; index: number }) => (
    <View style={[styles.rankingItem, index < 3 && styles.topRankItem]}>
      <View style={styles.rankBadge}>
        <Text style={[styles.rankText, { color: getRankColor(index) }]}>
          {getRankBadge(index)}
        </Text>
      </View>
      
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.username}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            {item.total_points} pts • {item.tournaments_won}/{item.total_tournaments} wins
          </Text>
        </View>
      </View>
      
      <View style={styles.eloContainer}>
        <Text style={styles.eloLabel}>ELO</Text>
        <Text style={styles.eloValue}>{item.elo_rating}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RANKINGS</Text>
        <Text style={styles.headerSubtitle}>Global Leaderboard</Text>
      </View>

      <FlatList
        data={rankings}
        renderItem={renderRanking}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No rankings yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  list: {
    padding: 16,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 16,
    marginBottom: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  topRankItem: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  rankBadge: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  eloContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  eloLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  eloValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
});
