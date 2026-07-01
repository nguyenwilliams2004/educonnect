import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useEnrollmentStore } from '@/store/enrollmentStore';
import { useRouter } from 'expo-router';

interface TrialRequestModalProps {
  visible: boolean;
  onClose: () => void;
  classInfo: {
    id: string;
    title: string;
    subject: string;
    schedule: string;
    price: number;
    teacherName?: string;
  };
  instructorId: number;
  instructorName: string;
}

export default function TrialRequestModal({
  visible, onClose, classInfo, instructorId, instructorName
}: TrialRequestModalProps) {
  const router = useRouter();
  const { requestTrial } = useEnrollmentStore();

  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!parentName.trim() || !parentPhone.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền họ tên và số điện thoại phụ huynh.');
      return;
    }
    if (!/^0[0-9]{9}$/.test(parentPhone.trim())) {
      Alert.alert('Số điện thoại không hợp lệ', 'Vui lòng nhập đúng định dạng số điện thoại Việt Nam (10 chữ số, bắt đầu bằng 0).');
      return;
    }

    requestTrial({
      classId: classInfo.id,
      classTitle: classInfo.title,
      instructorId,
      instructorName,
      subject: classInfo.subject,
      schedule: classInfo.schedule,
      price: classInfo.price,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      studentName: studentName.trim(),
      studentAge: studentAge.trim(),
      note: note.trim(),
    });

    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setParentName('');
    setParentPhone('');
    setStudentName('');
    setStudentAge('');
    setNote('');
    onClose();
  };

  const handleGoToEnrollments = () => {
    handleClose();
    router.push('/(tabs)/enrollments');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>
                  {submitted ? '✅ Đăng ký thành công!' : '🎓 Đăng ký học thử'}
                </Text>
                <Text style={styles.headerSub} numberOfLines={1}>{classInfo.title}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {submitted ? (
              /* ── SUCCESS STATE ── */
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Text style={{ fontSize: 48 }}>🎉</Text>
                </View>
                <Text style={styles.successTitle}>Yêu cầu đã được gửi!</Text>
                <Text style={styles.successDesc}>
                  Chúng tôi sẽ liên hệ xếp lịch buổi học thử trong vòng <Text style={{ fontFamily: 'Inter_600SemiBold', color: Colors.primary }}>24 giờ</Text>.{'\n\n'}
                  Quy trình tiếp theo:{'\n'}
                  <Text style={{ color: Colors.primary }}>① </Text>Học thử buổi đầu{'\n'}
                  <Text style={{ color: Colors.primary }}>② </Text>CSKH gọi điện xác nhận{'\n'}
                  <Text style={{ color: Colors.primary }}>③ </Text>Phụ huynh OK → Thanh toán
                </Text>

                <TouchableOpacity style={styles.viewBtn} onPress={handleGoToEnrollments}>
                  <Ionicons name="list" size={18} color={Colors.surface} />
                  <Text style={styles.viewBtnText}>Xem đơn đăng ký của tôi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeTextBtn} onPress={handleClose}>
                  <Text style={styles.closeTextBtnText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ── FORM STATE ── */
              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                {/* Class info */}
                <View style={styles.classInfoCard}>
                  <View style={styles.classInfoRow}>
                    <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                    <Text style={styles.classInfoText}>{classInfo.schedule}</Text>
                  </View>
                  <View style={styles.classInfoRow}>
                    <Ionicons name="person-outline" size={15} color={Colors.primary} />
                    <Text style={styles.classInfoText}>{classInfo.teacherName || instructorName}</Text>
                  </View>
                  <View style={[styles.classInfoRow, { marginBottom: 0 }]}>
                    <Ionicons name="cash-outline" size={15} color={Colors.primary} />
                    <Text style={[styles.classInfoText, { color: Colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                      Học thử MIỄN PHÍ – Chỉ thu phí khi hài lòng
                    </Text>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Thông tin phụ huynh <Text style={{ color: Colors.error }}>*</Text></Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Họ và tên phụ huynh <Text style={{ color: Colors.error }}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nguyễn Văn An"
                    value={parentName}
                    onChangeText={setParentName}
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại liên hệ <Text style={{ color: Colors.error }}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0901234567"
                    value={parentPhone}
                    onChangeText={setParentPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <Text style={styles.sectionLabel}>Thông tin học viên (tùy chọn)</Text>

                <View style={styles.row2}>
                  <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.label}>Tên học viên</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nguyễn Bảo Minh"
                      value={studentName}
                      onChangeText={setStudentName}
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Tuổi</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="12"
                      value={studentAge}
                      onChangeText={setStudentAge}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Ghi chú (học lực, mục tiêu…)</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    placeholder="VD: Con đang học lớp 8, mất gốc Toán từ lớp 6, mục tiêu vào trường điểm…"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Ionicons name="send" size={18} color={Colors.surface} />
                  <Text style={styles.submitBtnText}>Gửi yêu cầu học thử</Text>
                </TouchableOpacity>

                <View style={{ height: 24 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: Typography.lg,
    color: Colors.text,
  },
  headerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    marginTop: 2,
  },
  classInfoCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  classInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  classInfoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.sm,
    color: Colors.text,
    flex: 1,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: Typography.sm,
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.base,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row2: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    ...Shadow.md,
  },
  submitBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: Typography.base,
    color: Colors.surface,
  },
  // Success state
  successContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: Typography.xl,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  viewBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: Typography.base,
    color: Colors.surface,
  },
  closeTextBtn: {
    paddingVertical: 12,
  },
  closeTextBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: Typography.base,
    color: Colors.textMuted,
  },
});
