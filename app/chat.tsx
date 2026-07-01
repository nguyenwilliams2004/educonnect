import React, { useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

interface ChatMsg { id: number; text: string; me: boolean; time: string; }

const INITIAL_MESSAGES: ChatMsg[] = [
  { id: 1, text: 'Xin chào! Tôi thấy em cần học Toán, tôi có thể giúp được.', me: false, time: '10:00' },
  { id: 2, text: 'Cô ơi, em đang yếu phần giải tích ạ.', me: true, time: '10:02' },
  { id: 3, text: 'Để tôi thiết kế lộ trình học phù hợp cho em. Mình có thể học thử buổi đầu miễn phí.', me: false, time: '10:05' },
];

export default function ChatScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: 'Nguyễn Thị Lan Anh' });
  }, [navigation]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages((prev) => [...prev, { id: prev.length + 1, text: input.trim(), me: true, time }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: 'Tôi sẽ phản hồi sớm nhé! Cảm ơn em.', me: false, time },
      ]);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item: m }) => (
          <View style={[styles.bubbleWrap, m.me && styles.bubbleWrapMe]}>
            <View style={[styles.bubble, m.me ? styles.bubbleMe : styles.bubbleOther]}>
              <Text style={[styles.bubbleText, m.me && styles.bubbleTextMe]}>{m.text}</Text>
            </View>
            <Text style={styles.time}>{m.time}</Text>
          </View>
        )}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={Colors.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} onPress={send} disabled={!input.trim()}>
          <Ionicons name="send" size={18} color={input.trim() ? Colors.surface : Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing.xl },
  bubbleWrap: { alignItems: 'flex-start', maxWidth: '78%', gap: 3 },
  bubbleWrapMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { padding: Spacing.md, borderRadius: 18, borderBottomLeftRadius: 4, backgroundColor: Colors.surface, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border },
  bubbleMe: { borderRadius: 18, borderBottomRightRadius: 4, backgroundColor: Colors.accent, borderWidth: 0 },
  bubbleOther: {},
  bubbleText: { fontFamily: 'Inter_400Regular', fontSize: Typography.base, color: Colors.text, lineHeight: 22 },
  bubbleTextMe: { color: Colors.surface },
  time: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted },
  inputBar: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: Colors.background, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: 10, fontFamily: 'Inter_400Regular', fontSize: Typography.base, color: Colors.text, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
