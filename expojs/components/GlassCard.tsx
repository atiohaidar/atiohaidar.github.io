import React, { ComponentProps } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

type CardProps = ComponentProps<typeof Card>;

type GlassCardProps = CardProps & {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

/**
 * A reusable GlassCard component that simulates the "Modern Dark Glass" aesthetic.
 * It uses a semi-transparent background color (defined in theme) and a subtle border.
 */
export const GlassCard: React.FC<GlassCardProps> = ({ children, style, mode = 'elevated', ...props }) => {
    const theme = useTheme();

    // Dynamic styles based on theme
    const glassStyles = {
        backgroundColor: theme.dark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1,
    };

    const cardElevation = mode === 'elevated' ? (theme.dark ? 0 : 2) : undefined;

    return (
        <Card
            style={[styles.card, glassStyles, style]}
            mode={mode}
            elevation={cardElevation as any}
            {...props}
        >
            {children}
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
});
