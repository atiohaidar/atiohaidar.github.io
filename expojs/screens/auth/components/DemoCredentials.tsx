import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface DemoCredentialsProps {
  themeColor: string;
}

export const DemoCredentials: React.FC<DemoCredentialsProps> = ({ themeColor }) => {
  return (
    <View style={styles.infoCard}>
      <Text variant="bodySmall" style={{ color: themeColor }}>
        Demo Credentials:
      </Text>
      <Text variant="bodySmall" style={{ color: themeColor }}>
        Admin: admin / admin123
      </Text>
      <Text variant="bodySmall" style={{ color: themeColor }}>
        User: user / user123
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginTop: 8,
  },
});
