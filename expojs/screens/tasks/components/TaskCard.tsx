import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Checkbox, IconButton, Chip, useTheme, Card } from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import type { Task } from '@/types/api';

export interface TaskCardProps {
    task: Task;
    canEdit: boolean;
    onToggleComplete: (task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
}

export function TaskCard({ task, canEdit, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
    const theme = useTheme();

    return (
        <GlassCard style={styles.taskCard} mode="elevated">
            <Card.Content>
                <View style={styles.taskHeader}>
                    <View style={styles.taskTitleRow}>
                        <Checkbox
                            status={task.completed ? 'checked' : 'unchecked'}
                            onPress={() => canEdit && onToggleComplete(task)}
                            disabled={!canEdit}
                        />
                        <View style={styles.taskInfo}>
                            <Text
                                variant="titleMedium"
                                style={[styles.taskName, task.completed && styles.completedTask]}
                            >
                                {task.name}
                            </Text>
                            {task.description ? (
                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {task.description}
                                </Text>
                            ) : null}
                            <View style={styles.taskMeta}>
                                {task.due_date ? (
                                    <Chip icon="calendar" compact style={styles.chip}>
                                        {new Date(task.due_date).toLocaleDateString()}
                                    </Chip>
                                ) : null}
                                {task.owner ? (
                                    <Chip icon="account" compact style={styles.chip}>
                                        {task.owner}
                                    </Chip>
                                ) : null}
                            </View>
                        </View>
                    </View>
                    {canEdit ? (
                        <View style={styles.taskActions}>
                            <IconButton icon="pencil" size={20} onPress={() => onEdit(task)} />
                            <IconButton icon="delete" size={20} onPress={() => onDelete(task)} />
                        </View>
                    ) : null}
                </View>
            </Card.Content>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    taskCard: {
        elevation: 2,
        marginBottom: 12,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    taskTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    taskInfo: {
        flex: 1,
        marginLeft: 8,
    },
    taskName: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    completedTask: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    taskMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    chip: {
        height: 28,
    },
    taskActions: {
        flexDirection: 'row',
    },
});
