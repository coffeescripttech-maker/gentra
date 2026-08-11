import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** expo-haptics is native-only; web silently no-ops. */
const IS_NATIVE = Platform.OS !== 'web';

/** Subtle button feedback. */
export function hapticLight() {
  if (!IS_NATIVE) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Selection tick — countdowns, segmented controls. */
export function hapticTick() {
  if (!IS_NATIVE) return;
  Haptics.selectionAsync().catch(() => {});
}

/** Success — booking accepted, payment confirmed. */
export function hapticSuccess() {
  if (!IS_NATIVE) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Warning — decline, emergency, errors. */
export function hapticWarning() {
  if (!IS_NATIVE) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
