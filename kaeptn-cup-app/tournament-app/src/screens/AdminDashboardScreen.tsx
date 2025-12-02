import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, TextInput, DataTable } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { theme } from '../theme/colors';

interface User {
  id: number;
  username: string;
  email: string;
  rank: number;
  elo_rating: number;
  created_at: string;
  is_admin: boolean;
}

export default function AdminDashboardScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadUsers();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsAdmin(user.is_admin === true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setResetting(true);
    try {
      await authAPI.resetPassword({ userId: selectedUser.id, newPassword });
      Alert.alert('Success', `Password reset for ${selectedUser.username}`);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Admin access required</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>USER MANAGEMENT</Text>
        <Text style={styles.subtitle}>Total Users: {users.length}</Text>
      </View>

      {selectedUser && (
        <Card style={styles.resetCard}>
          <Card.Content>
            <Text style={styles.resetTitle}>Reset Password for: {selectedUser.username}</Text>
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.text}
            />
            <View style={styles.resetButtons}>
              <Button
                mode="contained"
                onPress={handleResetPassword}
                loading={resetting}
                buttonColor={theme.colors.primary}
                style={styles.resetButton}
              >
                RESET
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedUser(null);
                  setNewPassword('');
                }}
                textColor={theme.colors.text}
                style={styles.cancelButton}
              >
                CANCEL
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <DataTable>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title textStyle={styles.headerText}>Username</DataTable.Title>
              <DataTable.Title textStyle={styles.headerText}>Rank</DataTable.Title>
              <DataTable.Title textStyle={styles.headerText}>Admin</DataTable.Title>
              <DataTable.Title textStyle={styles.headerText}>Action</DataTable.Title>
            </DataTable.Header>

            {users.map((user) => (
              <DataTable.Row key={user.id} style={styles.tableRow}>
                <DataTable.Cell textStyle={styles.cellText}>{user.username}</DataTable.Cell>
                <DataTable.Cell textStyle={styles.cellText}>{user.rank}</DataTable.Cell>
                <DataTable.Cell textStyle={styles.cellText}>
                  {user.is_admin ? '✓' : '✗'}
                </DataTable.Cell>
                <DataTable.Cell>
                  <Button
                    mode="text"
                    onPress={() => setSelectedUser(user)}
                    textColor={theme.colors.primary}
                    compact
                  >
                    Reset PW
                  </Button>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: 16,
  },
  resetCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  resetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: theme.colors.background,
  },
  resetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
    borderColor: theme.colors.border,
  },
  tableHeader: {
    backgroundColor: theme.colors.primary,
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cellText: {
    color: theme.colors.text,
    fontSize: 14,
  },
});
