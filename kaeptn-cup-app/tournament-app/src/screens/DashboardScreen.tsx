import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, Image } from 'react-native';
import { Card, Title, Paragraph, Button, List, Text, SegmentedButtons } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tournamentsAPI, newsAPI } from '../services/api';
import { Tournament } from '../types';
import { theme } from '../theme/colors';

interface News {
  id: number;
  type: string;
  title: string;
  content?: string;
  url?: string;
  image_url?: string;
  created_by: number;
  created_at: string;
}

export default function DashboardScreen({ navigation }: any) {
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [selectedTab, setSelectedTab] = useState('meta');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadDashboardData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (user) {
        setIsAdmin(user.is_admin || false);
      }

      const tournamentsResponse = await tournamentsAPI.getAll();
      const pending = tournamentsResponse.data.filter(
        (t: Tournament) => t.status === 'pending'
      ).slice(0, 5);
      setUpcomingTournaments(pending);

      const newsResponse = await newsAPI.getAll();
      setNews(newsResponse.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const metaNews = news.filter(n => n.type === 'meta');
  const patchNotesNews = news.filter(n => n.type === 'patch_notes');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DASHBOARD</Text>
        <Text style={styles.headerSubtitle}>Tournament & News Hub</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>NEWS</Text>
              <View style={styles.accentLine} />
            </View>

            {isAdmin && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ManageNews')}
                buttonColor={theme.colors.primary}
                style={styles.manageButton}
                labelStyle={styles.buttonLabel}
              >
                MANAGE NEWS
              </Button>
            )}

            <SegmentedButtons
              value={selectedTab}
              onValueChange={setSelectedTab}
              buttons={[
                { value: 'meta', label: 'Meta' },
                { value: 'patch_notes', label: 'Patch Notes' },
              ]}
              style={styles.segmentedButtons}
              theme={{
                colors: {
                  secondaryContainer: theme.colors.primary,
                  onSecondaryContainer: theme.colors.text,
                }
              }}
            />

            {selectedTab === 'meta' ? (
              <View style={styles.tabContent}>
                {metaNews.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No meta news yet</Text>
                    <Text style={styles.emptySubtext}>Check back later!</Text>
                  </View>
                ) : (
                  metaNews.map((item) => (
                    <View key={item.id} style={styles.newsItem}>
                      <Text style={styles.newsTitle}>{item.title}</Text>
                      {item.content && (
                        <Text style={styles.newsContent}>{item.content}</Text>
                      )}
                      {item.image_url && (
                        <TouchableOpacity onPress={() => setSelectedImage(item.image_url || null)}>
                          <Image
                            source={{ uri: item.image_url }}
                            style={styles.newsImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      )}
                      <Text style={styles.newsDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            ) : (
              <View style={styles.tabContent}>
                {patchNotesNews.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No patch notes yet</Text>
                    <Text style={styles.emptySubtext}>Check back later!</Text>
                  </View>
                ) : (
                  patchNotesNews.map((item) => (
                    <View key={item.id} style={styles.newsItem}>
                      <Text style={styles.newsTitle}>{item.title}</Text>
                      {item.url && (
                        <View style={styles.webViewContainer}>
                          <WebView
                            source={{ uri: item.url }}
                            style={styles.webView}
                            scalesPageToFit={true}
                          />
                        </View>
                      )}
                      <Text style={styles.newsDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>UPCOMING TOURNAMENTS</Text>
              <View style={styles.accentLine} />
            </View>
            {upcomingTournaments.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upcoming tournaments</Text>
                <Text style={styles.emptySubtext}>Check back soon for new events!</Text>
              </View>
            ) : (
              upcomingTournaments.map((tournament) => (
                <TouchableOpacity
                  key={tournament.id}
                  style={styles.tournamentItem}
                  onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })}
                >
                  <View style={styles.tournamentInfo}>
                    <Text style={styles.tournamentName}>{tournament.name}</Text>
                    <Text style={styles.tournamentDetails}>
                      {tournament.tournament_type} • {tournament.participant_count || 0}/{tournament.max_participants} Players
                    </Text>
                  </View>
                  <View style={styles.chevron}>
                    <Text style={styles.chevronText}>›</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="contained"
              onPress={() => navigation.navigate('Tournaments')}
              buttonColor={theme.colors.primary}
              labelStyle={styles.buttonLabel}
            >
              VIEW ALL TOURNAMENTS
            </Button>
          </Card.Actions>
        </Card>
      </ScrollView>

      <Modal
        visible={selectedImage !== null}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 16,
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
  manageButton: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  tabContent: {
    marginTop: 8,
  },
  newsItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  newsContent: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: 8,
  },
  newsDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  webViewContainer: {
    height: 400,
    marginBottom: 12,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tournamentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  tournamentDetails: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  chevron: {
    paddingLeft: 12,
  },
  chevronText: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  cardActions: {
    padding: 16,
  },
  buttonLabel: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
