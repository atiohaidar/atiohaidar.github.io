import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

interface LoginFieldsProps {
  username: string;
  password: string;
  disabled: boolean;
  showPassword: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
}

export const LoginFields: React.FC<LoginFieldsProps> = ({
  username,
  password,
  disabled,
  showPassword,
  onUsernameChange,
  onPasswordChange,
  onToggleShowPassword,
}) => {
  return (
    <View>
      <TextInput
        label="Username"
        value={username}
        onChangeText={onUsernameChange}
        mode="outlined"
        autoCapitalize="none"
        autoCorrect={false}
        left={<TextInput.Icon icon="account" />}
        style={styles.input}
        disabled={disabled}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={onPasswordChange}
        mode="outlined"
        secureTextEntry={!showPassword}
        left={<TextInput.Icon icon="lock" />}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={onToggleShowPassword}
          />
        }
        style={styles.input}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
});
