import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../theme/colors';

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AGB</Text>
          <View style={styles.accentLine} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutzungsbedingungen der App „Kaeptn Cup"</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Geltungsbereich</Text>
          <Text style={styles.bodyText}>
            Diese Nutzungsbedingungen gelten für die Nutzung der mobilen App „Kaeptn Cup" (nachfolgend „App") des Anbieters Benjamin Günther, Neustr. 20, 45525 Hattingen.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Leistungsumfang</Text>
          <Text style={styles.bodyText}>
            Die App wird kostenlos bereitgestellt. Es besteht kein Anspruch auf ständige Verfügbarkeit.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Nutzerkonto</Text>
          <Text style={styles.bodyText}>
            Du bist verpflichtet, deine Zugangsdaten geheim zu halten und darfst die App nicht an Dritte weitergeben.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Urheberrecht und Nutzungsrechte</Text>
          <Text style={styles.bodyText}>
            Alle Rechte an der App, dem Design und den Inhalten verbleiben beim Anbieter. Du erhältst ein einfaches, nicht übertragbares Nutzungsrecht für den persönlichen Gebrauch.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Verbotene Nutzung</Text>
          <Text style={styles.bodyText}>
            Es ist untersagt, die App zu dekompilieren, zu verändern, für illegale Zwecke zu nutzen oder Schadcode einzuschleusen.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. In-App-Käufe und Widerrufsrecht</Text>
          <Text style={styles.bodyText}>
            Bei entgeltlichen Downloads und In-App-Käufen gilt das gesetzliche Widerrufsrecht von 14 Tagen. Mit dem ersten Start der App bzw. dem Freischalten eines digitalen Inhalts erlischt das Widerrufsrecht, wenn du vorher ausdrücklich zustimmst und zur Kenntnis genommen hast (siehe separater Hinweis beim Kauf).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Haftung</Text>
          <Text style={styles.bodyText}>
            Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit keine wesentlichen Vertragspflichten, Leben, Körper oder Gesundheit betroffen sind. Bei kostenlosen Apps ist die Haftung zusätzlich auf Vorsatz und grobe Fahrlässigkeit beschränkt.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Änderungen der App und der Bedingungen</Text>
          <Text style={styles.bodyText}>
            Wir können die App und diese Nutzungsbedingungen mit angemessener Frist ändern. Die Änderung wird dir in der App angezeigt und gilt als akzeptiert, wenn du die App danach weiter nutzt.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Schlussbestimmungen</Text>
          <Text style={styles.bodyText}>
            Es gilt deutsches Recht. Gerichtsstand ist, soweit zulässig, Hattingen.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bodyText}>Stand: Dezember 2025</Text>
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
  link: {
    fontSize: 15,
    color: theme.colors.primary,
    marginTop: 8,
  },
});
