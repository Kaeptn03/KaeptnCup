import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, SegmentedButtons } from 'react-native-paper';
import { newsAPI } from '../services/api';
import { theme } from '../theme/colors';

interface News {
  id: number;
  type: string;
  title: string;
  content?: string;
  url?: string;
  image_url?: string;
}

export default function ManageNewsScreen({ navigation }: any) {
  const [news, setNews] = useState<News[]>([]);
  const [newsType, setNewsType] = useState('meta');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await newsAPI.getAll();
      setNews(response.data);
    } catch (error) {
      console.error('Error loading news:', error);
      Alert.alert('Error', 'Failed to load news');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    if (newsType === 'patch_notes' && !url.trim()) {
      Alert.alert('Error', 'URL is required for Patch Notes');
      return;
    }

    try {
      const data = {
        type: newsType,
        title,
        ...(newsType === 'meta' && { 
          content: content.trim() || undefined,
          image_url: imageUrl.trim() || undefined 
        }),
        ...(newsType === 'patch_notes' && { url })
      };

      if (editingId) {
        await newsAPI.update(editingId, data);
        Alert.alert('Success', 'News updated successfully');
      } else {
        await newsAPI.create(data);
        Alert.alert('Success', 'News created successfully');
      }

      resetForm();
      loadNews();
    } catch (error) {
      console.error('Error saving news:', error);
      Alert.alert('Error', 'Failed to save news');
    }
  };

  const handleEdit = (item: News) => {
    setEditingId(item.id);
    setNewsType(item.type);
    setTitle(item.title);
    setContent(item.content || '');
    setUrl(item.url || '');
    setImageUrl(item.image_url || '');
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this news item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await newsAPI.delete(id);
              Alert.alert('Success', 'News deleted successfully');
              loadNews();
            } catch (error) {
              console.error('Error deleting news:', error);
              Alert.alert('Error', 'Failed to delete news');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setUrl('');
    setImageUrl('');
    setNewsType('meta');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MANAGE NEWS</Text>
        <Text style={styles.headerSubtitle}>Create & Edit News Items</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>
              {editingId ? 'EDIT NEWS' : 'CREATE NEWS'}
            </Text>

            <SegmentedButtons
              value={newsType}
              onValueChange={setNewsType}
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

            <TextInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  background: theme.colors.card,
                }
              }}
            />

            {newsType === 'meta' ? (
              <>
                <TextInput
                  label="Description (Optional)"
                  value={content}
                  onChangeText={setContent}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                  theme={{
                    colors: {
                      primary: theme.colors.primary,
                      background: theme.colors.card,
                    }
                  }}
                />

                <TextInput
                  label="Image URL (Optional)"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  mode="outlined"
                  style={styles.input}
                  theme={{
                    colors: {
                      primary: theme.colors.primary,
                      background: theme.colors.card,
                    }
                  }}
                />
              </>
            ) : (
              <TextInput
                label="Patch Notes URL"
                value={url}
                onChangeText={setUrl}
                mode="outlined"
                style={styles.input}
                placeholder="https://www.callofduty.com/patchnotes/..."
                theme={{
                  colors: {
                    primary: theme.colors.primary,
                    background: theme.colors.card,
                  }
                }}
              />
            )}

            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                buttonColor={theme.colors.primary}
                style={styles.submitButton}
                labelStyle={styles.buttonLabel}
              >
                {editingId ? 'UPDATE' : 'CREATE'}
              </Button>

              {editingId && (
                <Button
                  mode="outlined"
                  onPress={resetForm}
                  textColor={theme.colors.textSecondary}
                  style={styles.cancelButton}
                  labelStyle={styles.buttonLabel}
                >
                  CANCEL
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>EXISTING NEWS</Text>

            {news.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No news items yet</Text>
              </View>
            ) : (
              news.map((item) => (
                <View key={item.id} style={styles.newsItem}>
                  <View style={styles.newsInfo}>
                    <Text style={styles.newsTitle}>{item.title}</Text>
                    <Text style={styles.newsType}>
                      {item.type === 'meta' ? '📰 Meta' : '📝 Patch Notes'}
                    </Text>
                  </View>
                  <View style={styles.newsActions}>
                    <TouchableOpacity
                      onPress={() => handleEdit(item)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>
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
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  buttonLabel: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  newsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  newsInfo: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  newsType: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  newsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  deleteText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
