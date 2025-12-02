import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { TextInput, Button, Text, Checkbox } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { theme } from '../theme/colors';

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [rank, setRank] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !inviteCode || !rank) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const rankNum = parseInt(rank);
    if (isNaN(rankNum) || rankNum < 13 || rankNum > 26) {
      Alert.alert('Error', 'Rank must be a number between 13 and 26');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Error', 'Please accept the Terms of Service');
      return;
    }

    if (!acceptedPrivacy) {
      Alert.alert('Error', 'Please accept the Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        username,
        email,
        password,
        inviteCode,
        rank: rankNum,
      });

      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      Alert.alert('Success', `Registration successful! Your invite code: ${response.data.user.invite_code}`);
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/kaeptn-logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>KAEPTN CUP</Text>
          <Text style={styles.subtitle}>TOURNAMENT PLATFORM</Text>
          <View style={styles.inviteBadge}>
            <Text style={styles.inviteText}>INVITE ONLY</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.text}
            theme={{ colors: { onSurfaceVariant: theme.colors.textSecondary } }}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.text}
            theme={{ colors: { onSurfaceVariant: theme.colors.textSecondary } }}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.text}
            theme={{ colors: { onSurfaceVariant: theme.colors.textSecondary } }}
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.text}
            theme={{ colors: { onSurfaceVariant: theme.colors.textSecondary } }}
          />

          <TextInput
            label="Invitation Code"
            value={inviteCode}
            onChangeText={setInviteCode}
            mode="outlined"
            style={styles.input}
            autoCapitalize="characters"
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.text}
            theme={{ colors: { onSurfaceVariant: theme.colors.textSecondary } }}
          />

          <TextInput
            label="Rank (13-26)"
            value={rank}
            onChangeText={setRank}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder="z.B. 15"
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.text}
            theme={{ colors: { onSurfaceVariant: theme.colors.textSecondary } }}
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              activeOpacity={0.7}
            >
              <Checkbox.Android
                status={acceptedTerms ? 'checked' : 'unchecked'}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                color={theme.colors.primary}
                uncheckedColor={theme.colors.textSecondary}
              />
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxText}>
                  Ich akzeptiere die{' '}
                  <Text 
                    style={styles.linkText}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('Terms');
                    }}
                  >
                    Allgemeinen Geschäftsbedingungen
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
              activeOpacity={0.7}
            >
              <Checkbox.Android
                status={acceptedPrivacy ? 'checked' : 'unchecked'}
                onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                color={theme.colors.primary}
                uncheckedColor={theme.colors.textSecondary}
              />
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxText}>
                  Ich akzeptiere die{' '}
                  <Text 
                    style={styles.linkText}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('Privacy');
                    }}
                  >
                    Datenschutzbestimmungen
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading || !acceptedTerms || !acceptedPrivacy}
            style={[
              styles.button,
              (!acceptedTerms || !acceptedPrivacy) && styles.buttonDisabled
            ]}
            buttonColor={theme.colors.primary}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            CREATE ACCOUNT
          </Button>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 12,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.primary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 12,
  },
  inviteBadge: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  inviteText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  button: {
    marginTop: 8,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginButton: {
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  loginText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkboxTextContainer: {
    flex: 1,
    marginLeft: 8,
    marginTop: 8,
  },
  checkboxText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
