import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  IconButton,
  useTheme,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ApiService from '@/services/api';
import { FormCreate, FormUpdate } from '@/types/api';

interface QuestionInput {
  id?: string;
  question_text: string;
  question_order: number;
}

export default function FormEditorScreen() {
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isEditMode = formId && formId !== 'new';

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { question_text: '', question_order: 1 },
  ]);

  useEffect(() => {
    if (isEditMode && formId) {
      loadForm();
    }
  }, [formId, isEditMode]);

  const loadForm = async () => {
    if (!formId) return;

    try {
      const data = await ApiService.getForm(formId);
      setTitle(data.form.title);
      setDescription(data.form.description || '');
      setQuestions(
        data.questions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          question_order: q.question_order,
        }))
      );
    } catch (error: any) {
      console.error('Failed to load form:', error);
      Alert.alert('Error', error.message || 'Failed to load form');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_order: questions.length + 1,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) {
      Alert.alert('Error', 'Form must have at least 1 question');
      return;
    }

    const newQuestions = questions.filter((_, i) => i !== index);
    // Reorder
    newQuestions.forEach((q, i) => {
      q.question_order = i + 1;
    });
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question_text = value;
    setQuestions(newQuestions);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap
    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    // Update order
    newQuestions.forEach((q, i) => {
      q.question_order = i + 1;
    });

    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Form title is required');
      return;
    }

    if (questions.some((q) => !q.question_text.trim())) {
      Alert.alert('Error', 'All questions must have text');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && formId) {
        const updateData: FormUpdate = {
          title: title.trim(),
          description: description.trim() || undefined,
          questions: questions.map((q) => ({
            id: q.id,
            question_text: q.question_text.trim(),
            question_order: q.question_order,
          })),
        };
        await ApiService.updateForm(formId, updateData);
        Alert.alert('Success', 'Form updated successfully');
      } else {
        const createData: FormCreate = {
          title: title.trim(),
          description: description.trim() || undefined,
          questions: questions.map((q) => ({
            question_text: q.question_text.trim(),
            question_order: q.question_order,
          })),
        };
        await ApiService.createForm(createData);
        Alert.alert('Success', 'Form created successfully');
      }
      router.back();
    } catch (error: any) {
      console.error('Failed to save form:', error);
      Alert.alert('Error', error.message || 'Failed to save form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading form...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <GlassCard style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {isEditMode ? 'Edit Form' : 'Create New Form'}
          </Text>

          <TextInput
            label="Form Title *"
            value={title}
            onChangeText={setTitle}
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
        </Card.Content>
      </GlassCard>

      <GlassCard style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Questions
          </Text>

          {questions.map((question, index) => (
            <GlassCard key={index} style={styles.questionCard} mode="outlined">
              <Card.Content>
                <View style={styles.questionHeader}>
                  <Text variant="labelLarge">Question {index + 1}</Text>
                  <View style={styles.questionActions}>
                    <IconButton
                      icon="arrow-up"
                      size={20}
                      disabled={index === 0}
                      onPress={() => handleMoveQuestion(index, 'up')}
                    />
                    <IconButton
                      icon="arrow-down"
                      size={20}
                      disabled={index === questions.length - 1}
                      onPress={() => handleMoveQuestion(index, 'down')}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={() => handleRemoveQuestion(index)}
                    />
                  </View>
                </View>

                <TextInput
                  label="Question Text *"
                  value={question.question_text}
                  onChangeText={(text) => handleQuestionChange(index, text)}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                />
              </Card.Content>
            </GlassCard>
          ))}

          <Button
            mode="outlined"
            icon="plus"
            onPress={handleAddQuestion}
            style={styles.addButton}
          >
            Add Question
          </Button>
        </Card.Content>
      </GlassCard>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          disabled={submitting}
          style={styles.actionButton}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={styles.actionButton}
        >
          {isEditMode ? 'Update Form' : 'Create Form'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  questionCard: {
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionActions: {
    flexDirection: 'row',
  },
  addButton: {
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
});
