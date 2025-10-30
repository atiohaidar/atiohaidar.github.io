import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useTheme } from '@/hooks/useTheme';

interface ConnectionStatusProps {
  showDetails?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showDetails = false,
}) => {
  const { colors } = useTheme();
  const { isConnected, connectionState } = useWebSocket();

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return colors.success || '#4CAF50';
      case 'connecting':
        return colors.warning || '#FF9800';
      case 'disconnected':
        return colors.error || '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  if (!showDetails && isConnected) {
    return null; // Don't show anything when connected and details not requested
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={[styles.text, { color: colors.text }]}>
        {getStatusText()}
      </Text>
      {showDetails && (
        <Text style={[styles.subtext, { color: colors.textSecondary }]}>
          Real-time messaging
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 10,
    marginLeft: 4,
  },
});
