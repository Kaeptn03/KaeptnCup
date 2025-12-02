import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Card, TextInput, Button, Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Bracket } from '../types';
import { bracketsAPI, tournamentsAPI } from '../services/api';
import { theme } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface TournamentWithBracket {
  id: number;
  name: string;
  status: string;
  bracket?: Bracket;
}

export default function BracketScreen() {
  const [tournaments, setTournaments] = useState<TournamentWithBracket[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user: User = JSON.parse(userStr);
        setIsAdmin(user.is_admin || false);
      }

      const [tournamentsRes, bracketsRes] = await Promise.all([
        tournamentsAPI.getAll(),
        bracketsAPI.getAll(),
      ]);

      const tournamentsData = tournamentsRes.data;
      const bracketsData = bracketsRes.data;

      const combined: TournamentWithBracket[] = tournamentsData.map((tournament: any) => ({
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        bracket: bracketsData.find((b: Bracket) => b.tournament_id === tournament.id),
      }));

      setTournaments(combined);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

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

  const getEmbedUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      
      if (pathParts.length >= 1) {
        const tournamentId = pathParts[pathParts.length - 1];
        return `https://challonge.com/${tournamentId}/module`;
      }
      
      return url;
    } catch (error) {
      return url;
    }
  };

  const handleSaveBracket = async (tournamentId: number) => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Only admins can add or modify brackets');
      return;
    }

    if (!editUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid Challonge URL');
      return;
    }

    try {
      await bracketsAPI.createOrUpdate({
        tournament_id: tournamentId,
        challonge_url: editUrl.trim(),
      });
      
      setEditingTournamentId(null);
      setEditUrl('');
      Alert.alert('Success', 'Bracket saved successfully!');
      loadData();
    } catch (error) {
      console.error('Error saving bracket:', error);
      Alert.alert('Error', 'Failed to save bracket');
    }
  };

  const handleDeleteBracket = (bracketId: number) => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Only admins can delete brackets');
      return;
    }

    Alert.alert(
      'Delete Bracket',
      'Are you sure you want to delete this bracket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await bracketsAPI.delete(bracketId);
              Alert.alert('Success', 'Bracket deleted successfully');
              loadData();
            } catch (error) {
              console.error('Error deleting bracket:', error);
              Alert.alert('Error', 'Failed to delete bracket');
            }
          },
        },
      ]
    );
  };

  const startEditingBracket = (tournament: TournamentWithBracket) => {
    setEditingTournamentId(tournament.id);
    setEditUrl(tournament.bracket?.challonge_url || '');
  };

  const cancelEditing = () => {
    setEditingTournamentId(null);
    setEditUrl('');
  };

  const renderTournamentBracket = (tournament: TournamentWithBracket) => {
    const isEditing = editingTournamentId === tournament.id;

    if (isEditing) {
      return (
        <Card key={tournament.id} style={styles.tournamentCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <Text style={styles.tournamentStatus}>
                  {tournament.status === 'pending' ? '📋 Pending' : 
                   tournament.status === 'in_progress' ? '⚡ In Progress' : 
                   '🏆 Completed'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.infoText}>
              Enter the Challonge bracket URL for this tournament.
            </Text>

            <Text style={styles.exampleLabel}>Example:</Text>
            <Text style={styles.exampleText}>
              https://challonge.com/de/nmr6m6ho
            </Text>

            <TextInput
              mode="outlined"
              label="Challonge URL"
              value={editUrl}
              onChangeText={setEditUrl}
              placeholder="https://challonge.com/..."
              style={styles.input}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.text}
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={() => handleSaveBracket(tournament.id)}
                style={styles.saveButton}
                buttonColor={theme.colors.primary}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                SAVE BRACKET
              </Button>

              <Button
                mode="text"
                onPress={cancelEditing}
                textColor={theme.colors.textSecondary}
              >
                Cancel
              </Button>
            </View>
          </Card.Content>
        </Card>
      );
    }

    if (tournament.bracket) {
      return (
        <Card key={tournament.id} style={styles.tournamentCard}>
          <Card.Content style={styles.noPadding}>
            <View style={styles.cardHeaderWithBracket}>
              <View style={styles.tournamentInfo}>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <View style={styles.statusRow}>
                  <View style={styles.liveBadge}>
                    <View style={styles.liveIndicator} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                  <Text style={styles.tournamentStatus}>
                    {tournament.status === 'pending' ? '📋 Pending' : 
                     tournament.status === 'in_progress' ? '⚡ In Progress' : 
                     '🏆 Completed'}
                  </Text>
                </View>
              </View>
              {isAdmin && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => startEditingBracket(tournament)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteBracket(tournament.bracket!.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.webViewContainer}>
              <WebView
                source={{ uri: getEmbedUrl(tournament.bracket.challonge_url) }}
                style={styles.webView}
                startInLoadingState={true}
                scalesPageToFit={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mixedContentMode="always"
              />
            </View>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card key={tournament.id} style={styles.tournamentCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.tournamentName}>{tournament.name}</Text>
              <Text style={styles.tournamentStatus}>
                {tournament.status === 'pending' ? '📋 Pending' : 
                 tournament.status === 'in_progress' ? '⚡ In Progress' : 
                 '🏆 Completed'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.emptyBracket}>
            <Text style={styles.emptyText}>No bracket configured</Text>
            {isAdmin && (
              <Button
                mode="contained"
                onPress={() => startEditingBracket(tournament)}
                style={styles.addButton}
                buttonColor={theme.colors.primary}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                ADD BRACKET
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BRACKETS</Text>
        <Text style={styles.headerSubtitle}>Tournament Brackets</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading brackets...</Text>
          </View>
        ) : tournaments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tournaments available</Text>
          </View>
        ) : (
          tournaments.map(renderTournamentBracket)
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  tournamentCard: {
    marginBottom: 20,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
  },
  noPadding: {
    padding: 0,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardHeaderWithBracket: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tournamentStatus: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 16,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  exampleLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  buttonRow: {
    gap: 8,
  },
  saveButton: {
    borderRadius: theme.borderRadius.md,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.success}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.success,
    letterSpacing: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  editText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: '600',
  },
  webViewContainer: {
    height: 500,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
  },
  emptyBracket: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  addButton: {
    borderRadius: theme.borderRadius.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
