import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, SegmentedButtons } from 'react-native-paper';
import { tournamentsAPI } from '../services/api';
import { theme } from '../theme/colors';

export default function CreateTournamentScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tournamentType, setTournamentType] = useState('single_elimination');
  const [maxParticipants, setMaxParticipants] = useState('32');
  const [startTime, setStartTime] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('kaeptn@mail.de');
  const [maxRank, setMaxRank] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a tournament name');
      return;
    }

    if (maxRank) {
      const rankNum = parseInt(maxRank);
      if (isNaN(rankNum) || rankNum < 13 || rankNum > 26) {
        Alert.alert('Error', 'Max Rank must be between 13 and 26');
        return;
      }
    }

    setLoading(true);
    try {
      await tournamentsAPI.create({
        name,
        description,
        tournament_type: tournamentType,
        max_participants: parseInt(maxParticipants),
        start_date: startTime || null,
        entry_fee: entryFee || null,
        paypal_email: entryFee ? paypalEmail : null,
        max_rank: maxRank ? parseInt(maxRank) : null,
      });

      Alert.alert('Success', 'Tournament created successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Create New Tournament</Title>

      <TextInput
        label="Tournament Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Title style={styles.sectionTitle}>Tournament Type</Title>
      <SegmentedButtons
        value={tournamentType}
        onValueChange={setTournamentType}
        buttons={[
          { value: 'single_elimination', label: 'Single' },
          { value: 'double_elimination', label: 'Double' },
          { value: 'round_robin', label: 'Round Robin' },
          { value: 'swiss', label: 'Swiss' },
        ]}
        style={styles.segmented}
      />

      <TextInput
        label="Max Participants"
        value={maxParticipants}
        onChangeText={setMaxParticipants}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        label="Start Time (z.B. 15.12.2025 18:00 Uhr)"
        value={startTime}
        onChangeText={setStartTime}
        mode="outlined"
        placeholder="Wann startet das Turnier?"
        style={styles.input}
      />

      <TextInput
        label="Max Rank (13-26, optional)"
        value={maxRank}
        onChangeText={setMaxRank}
        mode="outlined"
        keyboardType="numeric"
        placeholder="z.B. 16 (nur Rank 13-16 erlaubt)"
        style={styles.input}
      />

      <TextInput
        label="Entry Fee (z.B. 10€ oder Kostenlos)"
        value={entryFee}
        onChangeText={setEntryFee}
        mode="outlined"
        placeholder="Startgebühr?"
        style={styles.input}
      />

      {entryFee && (
        <>
          <Title style={styles.sectionTitle}>PayPal-Adresse auswählen</Title>
          <SegmentedButtons
            value={paypalEmail}
            onValueChange={setPaypalEmail}
            buttons={[
              { value: 'kaeptn@mail.de', label: 'Kaeptn' },
              { value: 'alithahamd.awad@gmail.com', label: 'Ali' },
            ]}
            style={styles.segmented}
          />
        </>
      )}

      <Button
        mode="contained"
        onPress={handleCreate}
        loading={loading}
        style={styles.button}
        buttonColor={theme.colors.primary}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        TURNIER ERSTELLEN
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
    color: theme.colors.text,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  input: {
    marginBottom: 15,
    backgroundColor: theme.colors.surface,
  },
  segmented: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
    marginBottom: 32,
    borderRadius: theme.borderRadius.md,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
