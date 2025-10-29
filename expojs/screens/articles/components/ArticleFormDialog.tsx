import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Dialog, TextInput, Button, Checkbox, Text } from 'react-native-paper';
import { Article } from '@/types/api';

export interface ArticleFormData {
  slug: string;
  title: string;
  content: string;
  published: boolean;
}

interface ArticleFormDialogProps {
  visible: boolean;
  loading: boolean;
  editingArticle: Article | null;
  formData: ArticleFormData;
  onChange: (changes: Partial<ArticleFormData>) => void;
  onDismiss: () => void;
  onSubmit: () => void;
}

const ArticleFormDialog: React.FC<ArticleFormDialogProps> = ({
  visible,
  loading,
  editingArticle,
  formData,
  onChange,
  onDismiss,
  onSubmit,
}) => {
  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <Dialog.Title>{editingArticle ? 'Edit Article' : 'Create Article'}</Dialog.Title>
      <Dialog.ScrollArea>
        <ScrollView>
          {!editingArticle && (
            <TextInput
              label="Slug (URL-friendly ID)"
              value={formData.slug}
              onChangeText={(text) => onChange({ slug: text })}
              mode="outlined"
              style={styles.input}
              disabled={loading}
              autoCapitalize="none"
            />
          )}
          <TextInput
            label="Title"
            value={formData.title}
            onChangeText={(text) => onChange({ title: text })}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />
          <TextInput
            label="Content"
            value={formData.content}
            onChangeText={(text) => onChange({ content: text })}
            mode="outlined"
            multiline
            numberOfLines={10}
            style={styles.input}
            disabled={loading}
          />
          <View style={styles.checkboxRow}>
            <Checkbox
              status={formData.published ? 'checked' : 'unchecked'}
              onPress={() => onChange({ published: !formData.published })}
              disabled={loading}
            />
            <Text variant="bodyLarge">Publish article</Text>
          </View>
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions>
        <Button onPress={onDismiss} disabled={loading}>
          Cancel
        </Button>
        <Button onPress={onSubmit} loading={loading} disabled={loading}>
          {editingArticle ? 'Update' : 'Create'}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  input: {
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default ArticleFormDialog;
