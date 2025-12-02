import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, FAB, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tournamentsAPI } from '../services/api';
import { Tournament, User } from '../types';
import { theme } from '../theme/colors';

export default function TournamentsScreen({ navigation }: any) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadTournaments = async () => {
    try {
      const response = await tournamentsAPI.getAll();
      setTournaments(response.data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTournaments();
      checkAdminStatus();
    });
    return unsubscribe;
  }, [navigation]);

  const checkAdminStatus = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user: User = JSON.parse(userStr);
        setIsAdmin(user.is_admin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTournaments();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'in_progress': return theme.colors.success;
      case 'completed': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pending': return `${theme.colors.warning}20`;
      case 'in_progress': return `${theme.colors.success}20`;
      case 'completed': return `${theme.colors.border}40`;
      default: return `${theme.colors.border}40`;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    return dateString;
  };

  const renderTournament = ({ item }: { item: Tournament }) => (
    <TouchableOpacity onPress={() => navigation.navigate('TournamentDetail', { tournamentId: item.id })}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status), borderColor: getStatusColor(item.status) }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.description}>{item.description || 'No description'}</Text>
          {item.start_date && (
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateTimeIcon}>📅</Text>
              <Text style={styles.dateTimeText}>{formatDateTime(item.start_date)}</Text>
            </View>
          )}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>TYPE</Text>
              <Text style={styles.infoValue}>{item.tournament_type.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{item.entry_fee ? 'ENTRY' : 'PLAYERS'}</Text>
              <Text style={styles.infoValue}>{item.entry_fee || `${item.participant_count || 0}/${item.max_participants}`}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TOURNAMENTS</Text>
        <Text style={styles.headerSubtitle}>Join the Competition</Text>
      </View>
      
      <FlatList
        data={tournaments}
        renderItem={renderTournament}
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
            <Text style={styles.emptyText}>No tournaments yet</Text>
            <Text style={styles.emptySubtext}>Be the first to create one!</Text>
          </View>
        }
      />
      
      {isAdmin && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('CreateTournament')}
          color={theme.colors.text}
        />
      )}
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
  card: {
    marginBottom: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 16,
  },
  dateTimeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
