import React, { useState } from 'react';
import { View, Platform, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { TextInput, Text, Button, useTheme, Portal } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerInputProps {
    label: string;
    value: string;
    onChange: (date: string) => void;
    mode?: 'date' | 'time' | 'datetime';
    placeholder?: string;
    disabled?: boolean;
    style?: object;
    minimumDate?: Date;
    maximumDate?: Date;
}

export function DatePickerInput({
    label,
    value,
    onChange,
    mode = 'date',
    placeholder,
    disabled = false,
    style,
    minimumDate,
    maximumDate,
}: DatePickerInputProps) {
    const [show, setShow] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(value ? new Date(value) : new Date());
    const theme = useTheme();

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
            if (event.type === 'set' && selectedDate) {
                const formatted = formatDate(selectedDate, mode);
                onChange(formatted);
            }
        } else {
            if (selectedDate) {
                setTempDate(selectedDate);
            }
        }
    };

    const handleConfirm = () => {
        const formatted = formatDate(tempDate, mode);
        onChange(formatted);
        setShow(false);
    };

    const formatDate = (date: Date, dateMode: 'date' | 'time' | 'datetime'): string => {
        if (dateMode === 'date') {
            return date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (dateMode === 'time') {
            return date.toTimeString().split(' ')[0].slice(0, 5); // HH:MM
        } else {
            // datetime - ISO format
            return date.toISOString().replace('Z', '').slice(0, 19);
        }
    };

    const formatDisplayValue = (val: string): string => {
        if (!val) return '';
        try {
            const date = new Date(val);
            if (mode === 'date') {
                return date.toLocaleDateString();
            } else if (mode === 'time') {
                return val;
            } else {
                return date.toLocaleString();
            }
        } catch {
            return val;
        }
    };

    const openPicker = () => {
        if (disabled) return;
        if (value) {
            setTempDate(new Date(value));
        } else {
            setTempDate(new Date());
        }
        setShow(true);
    };

    return (
        <View style={style}>
            <TouchableOpacity onPress={openPicker} activeOpacity={0.7} disabled={disabled}>
                <TextInput
                    label={label}
                    value={formatDisplayValue(value)}
                    mode="outlined"
                    editable={false}
                    pointerEvents="none"
                    placeholder={placeholder || (mode === 'date' ? 'Select date' : 'Select date & time')}
                    disabled={disabled}
                    right={<TextInput.Icon icon="calendar" onPress={openPicker} disabled={disabled} />}
                    style={styles.input}
                />
            </TouchableOpacity>

            {/* Android shows inline picker */}
            {show && Platform.OS === 'android' && (
                <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode={mode === 'datetime' ? 'date' : mode}
                    display="default"
                    onChange={handleChange}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                />
            )}

            {/* iOS uses modal with confirm button */}
            {show && Platform.OS === 'ios' && (
                <Portal>
                    <Modal
                        visible={show}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShow(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                                <Text variant="titleMedium" style={styles.modalTitle}>
                                    {label}
                                </Text>
                                <DateTimePicker
                                    value={tempDate}
                                    mode={mode === 'datetime' ? 'datetime' : mode}
                                    display="spinner"
                                    onChange={handleChange}
                                    minimumDate={minimumDate}
                                    maximumDate={maximumDate}
                                    style={styles.picker}
                                />
                                <View style={styles.modalActions}>
                                    <Button onPress={() => setShow(false)} mode="text">
                                        Cancel
                                    </Button>
                                    <Button onPress={handleConfirm} mode="contained">
                                        Confirm
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </Portal>
            )}

            {/* Web fallback - native date input */}
            {show && Platform.OS === 'web' && (
                <input
                    type={mode === 'datetime' ? 'datetime-local' : mode}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShow(false);
                    }}
                    style={styles.webInput as any}
                    autoFocus
                    onBlur={() => setShow(false)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: 'transparent',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    picker: {
        height: 200,
    },
    webInput: {
        marginTop: 8,
        padding: 12,
        fontSize: 16,
        borderRadius: 8,
        border: '1px solid #666',
        backgroundColor: '#1e1e1e',
        color: '#fff',
    },
});

export default DatePickerInput;
