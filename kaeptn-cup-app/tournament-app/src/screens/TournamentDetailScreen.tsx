import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, List, Divider, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tournamentsAPI } from '../services/api';
import { Tournament } from '../types';
import { theme } from '../theme/colors';

export default function TournamentDetailScreen({ route, navigation }: any) {
  const { tournamentId } = route.params;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  const loadTournament = async () => {
    try {
      const response = await tournamentsAPI.getById(tournamentId);
      setTournament(response.data);

      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        setUserId(user.id);
        setIsAdmin(user.is_admin || false);
        setUserRank(user.rank || null);
        const registered = response.data.participants?.some(
          (p: any) => p.user_id === user.id
        );
        setIsRegistered(registered || false);
      }
    } catch (error) {
      console.error('Error loading tournament:', error);
    }
  };

  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  const handleRegister = async () => {
    try {
      await tournamentsAPI.register(tournamentId);
      
      if (tournament?.paypal_email && tournament?.entry_fee) {
        Alert.alert(
          'Anmeldung erfolgreich!',
          `Bitte überweise ${tournament.entry_fee} an folgende PayPal-Adresse:\n\n${tournament.paypal_email}\n\nVergiss nicht, deinen Namen im Betreff anzugeben!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Success', 'Successfully registered for tournament');
      }
      
      loadTournament();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Registration failed');
    }
  };

  const handleUnregister = async () => {
    try {
      await tournamentsAPI.unregister(tournamentId);
      Alert.alert('Success', 'Successfully unregistered from tournament');
      loadTournament();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Unregister failed');
    }
  };

  const handleStartTournament = async () => {
    try {
      await tournamentsAPI.start(tournamentId);
      Alert.alert('Success', 'Tournament started successfully');
      loadTournament();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to start tournament');
    }
  };

  const handleDeleteTournament = async () => {
    Alert.alert(
      'Turnier löschen',
      'Möchtest du dieses Turnier wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await tournamentsAPI.delete(tournamentId);
              Alert.alert('Erfolg', 'Turnier wurde gelöscht');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Fehler', error.response?.data?.error || 'Löschen fehlgeschlagen');
            }
          },
        },
      ]
    );
  };

  const handleToggleRegistration = async () => {
    try {
      await tournamentsAPI.toggleRegistration(tournamentId);
      const newState = !tournament?.is_registration_open;
      Alert.alert(
        'Erfolg',
        newState ? 'Anmeldungen wurden geöffnet' : 'Anmeldungen wurden geschlossen'
      );
      loadTournament();
    } catch (error: any) {
      Alert.alert('Fehler', error.response?.data?.error || 'Fehler beim Ändern der Anmeldungen');
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'TBA';
    return dateString;
  };

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Title>Loading...</Title>
      </View>
    );
  }

  const isRankTooHigh = tournament.max_rank && userRank && userRank > tournament.max_rank;
  const isRegistrationClosed = !tournament.is_registration_open;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{tournament.name}</Title>
          <Paragraph style={styles.description}>{tournament.description}</Paragraph>
          <Divider style={styles.divider} />
          {tournament.start_date && (
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateTimeIcon}>📅</Text>
              <View>
                <Text style={styles.dateTimeLabel}>Start</Text>
                <Text style={styles.dateTimeValue}>{formatDateTime(tournament.start_date)}</Text>
              </View>
            </View>
          )}
          <Paragraph style={styles.infoText}>Type: {tournament.tournament_type.replace('_', ' ').toUpperCase()}</Paragraph>
          <Paragraph style={styles.infoText}>Status: {tournament.status.toUpperCase()}</Paragraph>
          {tournament.status === 'pending' && (
            <Paragraph style={tournament.is_registration_open ? styles.registrationOpen : styles.registrationClosed}>
              Anmeldungen: {tournament.is_registration_open ? '✅ Geöffnet' : '🔒 Geschlossen'}
            </Paragraph>
          )}
          <Paragraph style={styles.infoText}>Participants: {tournament.participants?.length || 0}/{tournament.max_participants}</Paragraph>
          {tournament.max_rank && (
            <Paragraph style={styles.rankText}>Max Rank: {tournament.max_rank} (Rank 13-{tournament.max_rank})</Paragraph>
          )}
          {userRank && (
            <Paragraph style={styles.userRankText}>Your Rank: {userRank}</Paragraph>
          )}
          {tournament.entry_fee && (
            <Paragraph style={styles.entryFeeText}>Entry Fee: {tournament.entry_fee}</Paragraph>
          )}
          {isRegistered && tournament.paypal_email && tournament.entry_fee && (
            <View style={styles.paypalContainer}>
              <Text style={styles.paypalTitle}>💳 Zahlungsinformationen</Text>
              <Text style={styles.paypalLabel}>Überweise {tournament.entry_fee} an:</Text>
              <Text style={styles.paypalEmail}>{tournament.paypal_email}</Text>
              <Text style={styles.paypalNote}>Bitte gib deinen Namen im Betreff an!</Text>
            </View>
          )}
        </Card.Content>
        <Card.Actions style={styles.actions}>
          {tournament.status === 'pending' && !isRegistered && (
            <>
              <Button 
                mode="contained" 
                onPress={handleRegister}
                disabled={isRankTooHigh || isRegistrationClosed}
              >
                {isRankTooHigh ? 'Rank zu hoch' : isRegistrationClosed ? 'Anmeldung geschlossen' : 'Register'}
              </Button>
              {isRankTooHigh && (
                <Text style={styles.rankWarning}>
                  ⚠️ Dein Rank ({userRank}) ist zu hoch für dieses Turnier (Max: {tournament.max_rank})
                </Text>
              )}
              {isRegistrationClosed && !isRankTooHigh && (
                <Text style={styles.rankWarning}>
                  🔒 Die Anmeldungen für dieses Turnier sind geschlossen
                </Text>
              )}
            </>
          )}
          {tournament.status === 'pending' && isRegistered && (
            <Button mode="outlined" onPress={handleUnregister}>Unregister</Button>
          )}
          {tournament.status === 'in_progress' || tournament.status === 'completed' ? (
            <Button mode="contained" onPress={() => navigation.navigate('Bracket', { tournamentId })}>
              View Bracket
            </Button>
          ) : null}
          {isAdmin && tournament.status === 'pending' && (
            <Button 
              mode="contained" 
              onPress={handleToggleRegistration}
              buttonColor={tournament.is_registration_open ? '#EF4444' : '#10B981'}
            >
              {tournament.is_registration_open ? '🔒 Anmeldungen schließen' : '✅ Anmeldungen öffnen'}
            </Button>
          )}
          {isAdmin && (
            <Button 
              mode="contained" 
              onPress={handleDeleteTournament}
              buttonColor="#DC2626"
              style={styles.deleteButton}
            >
              DELETE
            </Button>
          )}
        </Card.Actions>
      </Card>

      {tournament.participants && tournament.participants.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Participants ({tournament.participants.length})</Title>
            {tournament.participants.map((participant) => (
              <List.Item
                key={participant.id}
                title={participant.username}
                description={`Seed: ${participant.seed} | ELO: ${participant.elo_rating}`}
                left={props => <List.Icon {...props} icon="account" />}
              />
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: 10,
    elevation: 4,
    backgroundColor: theme.colors.card,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  divider: {
    marginVertical: 10,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 16,
  },
  dateTimeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTimeLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dateTimeValue: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 6,
  },
  entryFeeText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 6,
  },
  rankText: {
    fontSize: 15,
    color: '#FFA500',
    fontWeight: 'bold',
    marginTop: 4,
  },
  userRankText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  rankWarning: {
    fontSize: 13,
    color: '#FFA500',
    marginLeft: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  paypalContainer: {
    backgroundColor: `${theme.colors.primary}15`,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginTop: 16,
  },
  paypalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  paypalLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  paypalEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  paypalNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    flexWrap: 'wrap',
    gap: 8,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  registrationOpen: {
    fontSize: 15,
    color: '#10B981',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  registrationClosed: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: 'bold',
    marginBottom: 6,
  },
});
