import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card, Button, Text, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rankingsAPI, authAPI } from '../services/api';
import { User, Ranking } from '../types';
import { theme } from '../theme/colors';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [isEditingRank, setIsEditingRank] = useState(false);
  const [editedRank, setEditedRank] = useState('');

  const loadProfile = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);

        const rankingResponse = await rankingsAPI.getByUser(userData.id);
        setRanking(rankingResponse.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Profil löschen',
      'Möchtest du dein Profil wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => confirmDeleteAccount(),
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Letzte Bestätigung',
      'Bist du dir absolut sicher? Alle deine Daten, Statistiken und Turnier-Teilnahmen werden permanent gelöscht.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Endgültig löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await authAPI.deleteAccount();
              await AsyncStorage.clear();
              
              Alert.alert(
                'Profil gelöscht',
                'Dein Profil und alle zugehörigen Daten wurden erfolgreich gelöscht.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.replace('Login'),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Fehler', 'Profil konnte nicht gelöscht werden. Bitte versuche es später erneut.');
            }
          },
        },
      ]
    );
  };

  const handleEditRank = () => {
    setEditedRank(user?.rank?.toString() || '');
    setIsEditingRank(true);
  };

  const handleCancelEditRank = () => {
    setIsEditingRank(false);
    setEditedRank('');
  };

  const handleSaveRank = async () => {
    const rankNum = parseInt(editedRank);
    
    if (isNaN(rankNum) || rankNum < 13 || rankNum > 26) {
      Alert.alert('Fehler', 'Rank muss eine Zahl zwischen 13 und 26 sein');
      return;
    }

    try {
      const response = await authAPI.updateRank(rankNum);
      const updatedUser = { ...user, rank: response.data.rank };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditingRank(false);
      Alert.alert('Erfolg', 'Dein Rank wurde aktualisiert');
    } catch (error: any) {
      Alert.alert('Fehler', error.response?.data?.error || 'Rank konnte nicht aktualisiert werden');
    }
  };

  if (!user || !ranking) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PROFILE</Text>
          <Text style={styles.headerSubtitle}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <Text style={styles.headerSubtitle}>{user.username}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>ACCOUNT INFO</Text>
              <View style={styles.accentLine} />
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{user.username}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Your Rank</Text>
              {isEditingRank ? (
                <View style={styles.rankEditContainer}>
                  <TextInput
                    value={editedRank}
                    onChangeText={setEditedRank}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="13-26"
                    style={styles.rankInput}
                    outlineColor={theme.colors.border}
                    activeOutlineColor={theme.colors.primary}
                    textColor={theme.colors.text}
                    dense
                  />
                  <Button 
                    mode="text" 
                    onPress={handleSaveRank}
                    textColor={theme.colors.primary}
                    style={styles.rankButton}
                  >
                    Save
                  </Button>
                  <Button 
                    mode="text" 
                    onPress={handleCancelEditRank}
                    textColor={theme.colors.textSecondary}
                    style={styles.rankButton}
                  >
                    Cancel
                  </Button>
                </View>
              ) : (
                <View style={styles.rankDisplayContainer}>
                  <Text style={styles.infoValue}>{user.rank || '-'}</Text>
                  <Button 
                    mode="text" 
                    onPress={handleEditRank}
                    textColor={theme.colors.primary}
                    style={styles.editButton}
                  >
                    Edit
                  </Button>
                </View>
              )}
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.inviteSection}>
              <Text style={styles.inviteLabel}>YOUR INVITE CODE</Text>
              <View style={styles.inviteCodeContainer}>
                <Text style={styles.inviteCode}>{user.invite_code}</Text>
              </View>
              <Text style={styles.inviteHint}>Share this code to invite friends!</Text>
            </View>
          </Card.Content>
        </Card>

        {user.is_admin && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>ADMIN</Text>
                <View style={styles.accentLine} />
              </View>

              <TouchableOpacity 
                style={styles.legalRow}
                onPress={() => navigation.navigate('AdminDashboard')}
              >
                <Text style={styles.legalText}>User Management</Text>
                <Text style={styles.legalArrow}>›</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>LEGAL</Text>
              <View style={styles.accentLine} />
            </View>

            <TouchableOpacity 
              style={styles.legalRow}
              onPress={() => navigation.navigate('Impressum')}
            >
              <Text style={styles.legalText}>Impressum</Text>
              <Text style={styles.legalArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.legalRow}
              onPress={() => navigation.navigate('Terms')}
            >
              <Text style={styles.legalText}>AGB</Text>
              <Text style={styles.legalArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.legalRow}
              onPress={() => navigation.navigate('Privacy')}
            >
              <Text style={styles.legalText}>Datenschutz</Text>
              <Text style={styles.legalArrow}>›</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor={theme.colors.error}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          LOGOUT
        </Button>

        <Button
          mode="outlined"
          onPress={handleDeleteAccount}
          style={styles.deleteButton}
          textColor={theme.colors.error}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          PROFIL LÖSCHEN
        </Button>
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
  card: {
    margin: 16,
    marginTop: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 16,
  },
  inviteSection: {
    alignItems: 'center',
    paddingTop: 8,
  },
  inviteLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  inviteCodeContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginBottom: 8,
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 3,
  },
  inviteHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statRowLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  highlight: {
    color: theme.colors.primary,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: theme.borderRadius.md,
  },
  deleteButton: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    borderRadius: theme.borderRadius.md,
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  legalText: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
  },
  legalArrow: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: '300',
  },
  rankEditContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    height: 40,
  },
  rankButton: {
    minWidth: 50,
  },
  rankDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    minWidth: 50,
  },
});
