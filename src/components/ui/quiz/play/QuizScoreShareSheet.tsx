import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

import { QuizScoreShareCard } from '@components/ui/quiz/play/QuizScoreShareCard';
import { captureQuizScoreShareImage } from '@services/quiz/share/captureQuizScoreShareImage';
import { QUIZ_SHARE_CAPTURE_ID } from '@services/quiz/share/quizShareCaptureConstants';
import {
  shareImageViaFacebook,
  shareImageViaSystemSheet,
  shareImageViaWhatsApp,
} from '@services/quiz/share/quizScoreShareChannels';
import type { QuizScoreShareInput } from '@utils/quiz/buildQuizScoreShareMessage';

interface QuizScoreShareSheetProps {
  visible: boolean;
  onClose: () => void;
  shareInput: QuizScoreShareInput | null;
  shareVariant: 'max' | 'great' | 'default';
  fonts: { bold?: string; semiBold?: string; medium?: string };
}

type ShareChannel = 'whatsapp' | 'facebook' | 'more';

const OPTIONS: {
  id: ShareChannel;
  label: string;
  icon: ReactNode;
  color: string;
}[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    icon: <FontAwesome5 name="whatsapp" size={22} color="#25D366" />,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    icon: <FontAwesome5 name="facebook" size={22} color="#1877F2" />,
  },
  {
    id: 'more',
    label: 'Autres apps',
    color: '#424242',
    icon: <Feather name="share-2" size={22} color="#424242" />,
  },
];

export function QuizScoreShareSheet({
  visible,
  onClose,
  shareInput,
  shareVariant,
  fonts,
}: QuizScoreShareSheetProps) {
  const captureRefView = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const onPick = useCallback(
    async (channel: ShareChannel) => {
      if (!shareInput || sharing) return;
      setSharing(true);
      setShareError(null);
      try {
        await new Promise((r) => setTimeout(r, Platform.OS === 'web' ? 120 : 50));
        const imageUri = await captureQuizScoreShareImage(captureRefView);
        switch (channel) {
          case 'whatsapp':
            await shareImageViaWhatsApp(imageUri);
            break;
          case 'facebook':
            await shareImageViaFacebook(imageUri);
            break;
          case 'more':
            await shareImageViaSystemSheet(imageUri);
            break;
        }
        onClose();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Impossible de générer ou partager l’image.';
        setShareError(msg);
      } finally {
        setSharing(false);
      }
    },
    [shareInput, sharing, onClose],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} disabled={sharing} accessibilityRole="button" />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>Partager mon score</Text>
          <Text style={[styles.subtitle, fonts.medium && { fontFamily: fonts.medium }]}>
            Une carte stylée sera envoyée à tes contacts
          </Text>

          {shareInput ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.previewScroll}
              style={styles.previewWrap}
            >
              <View
                style={styles.previewScale}
                ref={Platform.OS === 'web' ? captureRefView : undefined}
                nativeID={Platform.OS === 'web' ? QUIZ_SHARE_CAPTURE_ID : undefined}
                collapsable={false}
              >
                <QuizScoreShareCard input={shareInput} variant={shareVariant} fonts={fonts} />
              </View>
            </ScrollView>
          ) : null}

          <View style={styles.grid}>
            {OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.option, sharing && styles.optionDisabled]}
                onPress={() => void onPick(opt.id)}
                disabled={sharing || !shareInput}
                accessibilityRole="button"
                accessibilityLabel={opt.label}
              >
                <View style={[styles.iconCircle, { borderColor: `${opt.color}33` }]}>{opt.icon}</View>
                <Text style={[styles.optionLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {sharing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#1F2261" />
              <Text style={[styles.loadingTxt, fonts.medium && { fontFamily: fonts.medium }]}>
                Génération de l’image…
              </Text>
            </View>
          ) : null}

          {shareError ? (
            <Text style={[styles.errorTxt, fonts.medium && { fontFamily: fonts.medium }]}>{shareError}</Text>
          ) : null}

          <Pressable onPress={onClose} style={styles.cancelBtn} disabled={sharing}>
            <Text style={[styles.cancelLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>Annuler</Text>
          </Pressable>
        </View>
      </View>

      {shareInput && visible && Platform.OS !== 'web' ? (
        <View style={styles.captureHost} pointerEvents="none" accessibilityElementsHidden>
          <View ref={captureRefView} collapsable={false}>
            <QuizScoreShareCard input={shareInput} variant={shareVariant} fonts={fonts} />
          </View>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 10,
    maxHeight: '88%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: -4 },
  previewWrap: { maxHeight: 280, marginVertical: 4 },
  previewScroll: { paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  previewScale: { transform: [{ scale: 0.82 }] },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    gap: 8,
  },
  optionDisabled: { opacity: 0.5 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: { fontSize: 13, fontWeight: '700', color: '#212121' },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingTxt: { fontSize: 14, color: '#616161' },
  errorTxt: {
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  cancelBtn: {
    marginTop: 4,
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelLabel: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  captureHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    opacity: 0.02,
    zIndex: -1,
  },
});
