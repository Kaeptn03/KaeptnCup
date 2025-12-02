import React from 'react';
import { View, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../theme/colors';

export default function ImpressumScreen() {
  const handleEmailPress = () => {
    Linking.openURL('mailto:kaeptn@mail.de');
  };

  const handleEULink = () => {
    Linking.openURL('https://ec.europa.eu/consumers/odr');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>IMPRESSUM</Text>
          <View style={styles.accentLine} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Anbieter dieser App:</Text>
          <Text style={styles.value}>Benjamin Günther</Text>
          <Text style={styles.value}>Neustr. 20</Text>
          <Text style={styles.value}>45525 Hattingen</Text>
          <Text style={styles.value}>Deutschland</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Kontakt:</Text>
          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={styles.link}>kaeptn@mail.de</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</Text>
          <Text style={styles.value}>Benjamin Günther</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EU-Streitschlichtung</Text>
          <Text style={styles.bodyText}>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
          </Text>
          <TouchableOpacity onPress={handleEULink}>
            <Text style={styles.link}>https://ec.europa.eu/consumers/odr</Text>
          </TouchableOpacity>
          <Text style={[styles.bodyText, { marginTop: 12 }]}>
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </Text>
          <Text style={[styles.bodyText, { marginTop: 12 }]}>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
            Verbraucherschlichtungsstelle teilzunehmen.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: 2,
    marginBottom: 8,
  },
  accentLine: {
    width: 60,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  link: {
    fontSize: 15,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 24,
  },
});
