import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { twitchAPI } from '../services/api';
import { TwitchStream } from '../types';
import { theme } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function StreamsScreen() {
  const [streams, setStreams] = useState<TwitchStream[]>([]);

  const loadStreams = async () => {
    try {
      const response = await twitchAPI.getStreams();
      setStreams(response.data);
    } catch (error) {
      console.error('Error loading streams:', error);
    }
  };

  useEffect(() => {
    loadStreams();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LIVE STREAMS</Text>
        <Text style={styles.headerSubtitle}>Watch the Action</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {streams.map((stream) => (
          <Card key={stream.id} style={styles.card}>
            <Card.Content>
              <View style={styles.streamHeader}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveIndicator} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
                <Text style={styles.streamTitle}>{stream.display_name || stream.channel_name}</Text>
              </View>
            </Card.Content>
            <View style={styles.streamContainer}>
              <WebView
                source={{
                  uri: `https://player.twitch.tv/?channel=${stream.channel_name}&parent=localhost&muted=false`,
                }}
                style={styles.stream}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
              />
            </View>
          </Card>
        ))}
        {streams.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active streams</Text>
            <Text style={styles.emptySubtext}>Check back later for live content!</Text>
          </View>
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
  card: {
    margin: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
    overflow: 'hidden',
  },
  streamHeader: {
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: `${theme.colors.error}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.error,
    marginBottom: 8,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.error,
    letterSpacing: 1,
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  streamContainer: {
    width: width - 32,
    height: (width - 32) * 9 / 16,
    backgroundColor: '#000',
  },
  stream: {
    flex: 1,
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
