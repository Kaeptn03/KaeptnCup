import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../theme/colors';

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DATENSCHUTZ</Text>
          <View style={styles.accentLine} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datenschutzerklärung</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Verantwortlicher im Sinne der DSGVO</Text>
          <Text style={styles.bodyText}>
            Benjamin Günther{'\n'}
            Neustr. 20{'\n'}
            45525 Hattingen{'\n'}
            E-Mail: kaeptn@mail.de
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Welche Daten wir erheben und warum</Text>
          
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Beim Herunterladen der App:</Text>{'\n'}
            → IP-Adresse, Gerätekennung, App-Version, Betriebssystem (über Apple App Store / Google Play)
          </Text>
          
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Beim Öffnen/Nutzen der App:</Text>{'\n'}
            → Geräte-ID, Gerätetyp, Betriebssystem-Version, Spracheinstellung, Zeitstempel{'\n'}
            → Crash-Reports und Nutzungsstatistiken (anonymisiert)
          </Text>
          
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Nur wenn du bestimmte Funktionen aktiv nutzt:</Text>{'\n'}
            → Standortdaten (nur mit deiner ausdrücklichen Einwilligung){'\n'}
            → Kamera / Mikrofon / Fotos (nur mit deiner ausdrücklicher Einwilligung){'\n'}
            → E-Mail-Adresse / Name (nur bei Registrierung / Kontaktformular)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Rechtsgrundlagen</Text>
          <Text style={styles.bodyText}>
            • Art. 6 Abs. 1 lit. b DSGVO (Vertragsdurchführung – z. B. App bereitstellen){'\n'}
            • Art. 6 Abs. 1 lit. a DSGVO (Einwilligung – z. B. Standort, Werbung){'\n'}
            • Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen – z. B. Fehlerbehebung, Betrugsprävention)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Verwendete Dienste / Empfänger der Daten</Text>
          <Text style={styles.bodyText}>
            • Apple App Store / Google Play (Download- und Zahlungsdaten){'\n'}
            • Firebase Crashlytics & Analytics (Google) – anonymisierte Crash- und Nutzungsdaten{'\n'}
            • Hosting/Server: Replit Cloud Infrastructure
          </Text>
          <Text style={styles.bodyText}>
            Mit allen Auftragsverarbeitern haben wir einen AV-Vertrag nach Art. 28 DSGVO geschlossen.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Speicherdauer</Text>
          <Text style={styles.bodyText}>
            Personenbezogene Daten werden gelöscht, sobald der Zweck entfällt und keine gesetzlichen Aufbewahrungsfristen (z. B. Handels-/Steuerrecht) entgegenstehen – in der Regel nach 30 Tagen (Logs) bis max. 6 Monate (Analytics-Daten).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Deine Rechte</Text>
          <Text style={styles.bodyText}>
            Du hast das Recht auf:{'\n'}
            • Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung{'\n'}
            • Datenübertragbarkeit{'\n'}
            • Widerspruch (besonders bei berechtigten Interessen){'\n'}
            • Widerruf von Einwilligungen mit Wirkung für die Zukunft{'\n'}
            • Beschwerde bei einer Aufsichtsbehörde (in Deutschland: Landesdatenschutzbeauftragte deines Bundeslandes)
          </Text>
          <Text style={styles.bodyText}>
            Kontakt für alle Anfragen: kaeptn@mail.de
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Datensicherheit</Text>
          <Text style={styles.bodyText}>
            Wir verwenden TLS-Verschlüsselung, regelmäßige Updates und sichere Server in der EU.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bodyText}>
            Für weitere Informationen kontaktieren Sie uns unter:
          </Text>
          <Text style={styles.link}>kaeptn@mail.de</Text>
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
  bodyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  link: {
    fontSize: 15,
    color: theme.colors.primary,
    marginTop: 8,
  },
});
