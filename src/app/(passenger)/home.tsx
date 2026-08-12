import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AnimatedNumber } from '@/components/ui/animated-number';
import { CustomIcon, type CustomIconKind } from '@/components/ui/custom-icon';
import { EmptyState } from '@/components/ui/empty-state';
import { FadeInView } from '@/components/ui/fade-in-view';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Sheet } from '@/components/ui/sheet';
import { Colors } from '@/constants/colors';
import { shadows } from '@/constants/shadows';
import { radius, spacing } from '@/constants/spacing';
import {
  FontFamily,
  FontSize,
  LetterSpacing,
  LineHeight
} from '@/constants/typography';
import { useSession } from '@/context/session';
import { useRebook } from '@/hooks/use-rebook';
import type { RideMode } from '@/types';
import { formatPeso } from '@/utils/fare';

type TileAction =
  | { kind: 'book'; mode?: RideMode }
  | { kind: 'tab'; path: Href }
  | { kind: 'promos' }
  | { kind: 'more' };

/** Services grid — Lucide glyphs, one accent color per tile for a lively flat row. */
const SERVICES: Array<{
  key: string;
  label: string;
  icon: IconName;
  color: string;
  custom?: CustomIconKind;
  action: TileAction;
}> = [
  {
    key: 'tricycle',
    label: 'Tricycle',
    icon: 'motorbike',
    color: Colors.brand,
    custom: 'tricycle',
    action: { kind: 'book', mode: 'special' }
  },
  {
    key: 'jeepney',
    label: 'Jeepney',
    icon: 'bus',
    color: Colors.driver,
    custom: 'jeepney',
    action: { kind: 'book', mode: 'shared' }
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: 'receipt',
    color: Colors.brand,
    custom: 'orders',
    action: { kind: 'tab', path: '/(passenger)/history' }
  },
  {
    key: 'wallet',
    label: 'Wallet',
    icon: 'wallet',
    custom: 'wallet',
    color: Colors.brand,
    action: { kind: 'tab', path: '/(passenger)/wallet' }
  },
  {
    key: 'places',
    label: 'Places',
    icon: 'map-marker-path',
    custom: 'places',
    color: Colors.brand,
    action: { kind: 'book' }
  },
  {
    key: 'promos',
    label: 'Promos',
    custom: 'promos',
    icon: 'tag-heart',
    color: Colors.brand,
    action: { kind: 'promos' }
  },
  {
    key: 'profile',
    label: 'Profile',
    custom: 'profile',
    icon: 'account-circle',
    color: Colors.brand,
    action: { kind: 'tab', path: '/(passenger)/profile' }
  },
  {
    key: 'more',
    label: 'More',
    icon: 'dots-horizontal',
    color: Colors.brand,
    action: { kind: 'more' }
  }
];

const PROMOS: Array<{
  id: string;
  icon: IconName;
  title: string;
  body: string;
  code: string;
  colors: readonly [string, string];
}> = [
  {
    id: 'p1',
    icon: 'tag-heart',
    title: 'New rider? ₱30 off',
    body: 'Your first 3 trips',
    code: 'NAGA30',
    colors: ['#F59E0B', '#EA580C']
  },
  {
    id: 'p2',
    icon: 'bus-clock',
    title: 'Jeepney saver',
    body: '₱20 off shared rides',
    code: 'SIPAG20',
    colors: ['#22C55E', '#059669']
  },
  {
    id: 'p3',
    icon: 'account-group',
    title: 'Refer a friend',
    body: 'You both get ₱50',
    code: 'BIYAYA',
    colors: ['#8B5CF6', '#6D28D9']
  }
];

/** Height of the curved carve-out under the hero gradient. */
const HERO_WAVE_H = 50;

const HERO_WAVE_PATH =
  'M0,30 C60,20 120,21 180,29 C240,37 315,39 375,34 C375,36 375,38 375,40 L0,40 Z';

export default function PassengerHomeScreen() {
  const router = useRouter();
  const { state } = useSession();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const rebook = useRebook();
  const lastTrip = state.receipts[0];

  const [promosOpen, setPromosOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const tileSize = (width - spacing.xxl * 2 - spacing.sm * 3) / 4;

  // The whole trip-building flow lives on the Where To? screen now.
  const openWhereTo = (mode?: RideMode) =>
    router.push({ pathname: '/where-to', params: mode ? { mode } : {} });

  const runAction = (action: TileAction) => {
    switch (action.kind) {
      case 'book':
        openWhereTo(action.mode);
        break;
      case 'tab':
        router.push(action.path);
        break;
      case 'promos':
        setPromosOpen(true);
        break;
      case 'more':
        setMoreOpen(true);
        break;
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* ── Gradient brand header ─────────────────────────────── */}
        <LinearGradient
          colors={Colors.brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          {/* Organic carve-out at the bottom — the green hero flows straight into the
            white content area beneath (pure fill, no border or stroke) */}
          <Svg
            pointerEvents="none"
            width={width}
            height={HERO_WAVE_H}
            viewBox="0 0 375 40"
            preserveAspectRatio="none"
            style={styles.headerWave}>
            <Path d={HERO_WAVE_PATH} fill={Colors.card} />
          </Svg>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>DALI-DALI</Text>
              <Text style={styles.greeting}>
                Hello, {state.passenger.name.split(' ')[0]}! 👋
              </Text>
              <Text style={styles.headerSub}>Where are you going today?</Text>
            </View>
            <View style={styles.headerActions}>
              <PressableScale
                accessibilityRole="button"
                style={styles.bell}
                onPress={() => setNotesOpen(true)}
                haptic>
                <Icon name="bell-outline" size={20} color={Colors.onAccent} />
              </PressableScale>
              <PressableScale
                accessibilityRole="button"
                style={styles.avatar}
                onPress={() => router.push('/(passenger)/profile')}
                haptic>
                <Image
                  source={require('../../../assets/images/avatar/user1.jpg')}
                  style={styles.avatarImg}
                />
              </PressableScale>
            </View>
          </View>

          {/* Wallet card */}
          <PressableScale
            accessibilityRole="button"
            style={styles.walletCard}
            onPress={() => router.push('/(passenger)/wallet')}
            haptic>
            <View>
              <Text style={styles.walletLabel}>Wallet balance</Text>
              <AnimatedNumber
                value={state.walletBalance}
                duration={600}
                format={v => formatPeso(Math.round(v))}
                style={styles.walletValue}
              />
            </View>
            <View style={styles.walletAdd}>
              <Icon name="plus" size={15} color={Colors.brand} />
              <Text style={styles.walletAddText}>Add</Text>
            </View>
          </PressableScale>

          {/* Where to? */}
          <PressableScale
            accessibilityRole="button"
            style={styles.whereTo}
            onPress={() => openWhereTo()}
            haptic>
            <View style={styles.whereToIcon}>
              <Icon name="magnify" size={18} color={Colors.brand} />
            </View>
            <Text style={styles.whereToText}>Where are you going?</Text>
            <Icon name="chevron-right" size={20} color={Colors.secondaryText} />
          </PressableScale>

          {/* Rebook the most recent ride with one tap */}
          {lastTrip && (
            <PressableScale
              accessibilityRole="button"
              style={styles.rebookRow}
              onPress={() => void rebook(lastTrip)}
              haptic>
              <View style={styles.rebookRowIcon}>
                <Icon name="refresh" size={15} color={Colors.brand} />
              </View>
              <View style={styles.rebookRowWrap}>
                <Text style={styles.rebookRowLabel} numberOfLines={1}>
                  Rebook last trip
                </Text>
                <Text style={styles.rebookRowRoute} numberOfLines={1}>
                  {lastTrip.pickup} → {lastTrip.destination}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={16}
                color={Colors.secondaryText}
              />
            </PressableScale>
          )}
        </LinearGradient>

        {/* ── Body ─────────────────────────────────────────────── */}
        <View style={styles.body}>
          <FadeInView>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.grid}>
              {SERVICES.map(s => (
                <PressableScale
                  key={s.key}
                  style={[styles.tile, { width: tileSize }]}
                  onPress={() => runAction(s.action)}
                  haptic>
                  {s.custom ? (
                    <CustomIcon kind={s.custom} size={60} />
                  ) : (
                    <Icon
                      name={s.icon}
                      size={60}
                      color={s.color}
                      strokeWidth={1.5}
                    />
                  )}
                  <Text style={styles.tileLabel}>{s.label}</Text>
                </PressableScale>
              ))}
            </View>
          </FadeInView>

          <FadeInView>
            <Text style={styles.sectionTitle}>Promos</Text>

            {/* Hero banner */}
            <PressableScale
              accessibilityRole="button"
              style={styles.banner}
              onPress={() => setPromosOpen(true)}
              haptic>
              <View style={styles.bannerEmoji}>
                <Text style={styles.bannerEmojiText}>🎉</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>New-rider deal</Text>
                <Text style={styles.bannerBody}>
                  ₱30 off your first 3 trips · code NAGA30
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={20}
                color="rgba(255,255,255,0.9)"
              />
            </PressableScale>
          </FadeInView>

          {/* Promo cards */}
          <FadeInView>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promoRow}>
              {PROMOS.map(p => (
                <PressableScale
                  key={p.id}
                  style={styles.promoCard}
                  onPress={() => setPromosOpen(true)}
                  haptic>
                  <LinearGradient
                    colors={p.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.promoFill}>
                    <View style={styles.promoIcon}>
                      <Icon name={p.icon} size={18} color={Colors.onAccent} />
                    </View>
                    <Text style={styles.promoTitle}>{p.title}</Text>
                    <Text style={styles.promoBody}>{p.body}</Text>
                    <View style={styles.promoCode}>
                      <Text style={styles.promoCodeText}>{p.code}</Text>
                    </View>
                  </LinearGradient>
                </PressableScale>
              ))}
            </ScrollView>
          </FadeInView>
        </View>
      </ScrollView>

      {/* ── Promos sheet ───────────────────────────────────────── */}
      <Sheet visible={promosOpen} onClose={() => setPromosOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Promos</Text>
          {PROMOS.map(p => (
            <View key={p.id} style={styles.promoDetailRow}>
              <View
                style={[
                  styles.promoDetailBadge,
                  { backgroundColor: `${p.colors[0]}1A` }
                ]}>
                <Icon name={p.icon} size={22} color={p.colors[0]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promoDetailTitle}>{p.title}</Text>
                <Text style={styles.promoDetailBody}>{p.body}</Text>
              </View>
              <View
                style={[styles.promoCode, { backgroundColor: Colors.muted }]}>
                <Text
                  style={[styles.promoCodeText, { color: Colors.primaryText }]}>
                  {p.code}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Sheet>

      {/* ── Notifications sheet ────────────────────────────────── */}
      <Sheet visible={notesOpen} onClose={() => setNotesOpen(false)}>
        <View style={styles.sheetContent}>
          <EmptyState
            icon="bell-outline"
            title="No new notifications"
            body="Trip alerts and promos will show up here."
          />
        </View>
      </Sheet>

      {/* ── More sheet ─────────────────────────────────────────── */}
      <Sheet visible={moreOpen} onClose={() => setMoreOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>More</Text>
          <PressableScale
            style={styles.moreRow}
            onPress={() => router.push('/(passenger)/profile')}
            haptic>
            <View style={[styles.placeDot, { backgroundColor: Colors.error }]}>
              <Icon name="account-alert" size={16} color={Colors.onAccent} />
            </View>
            <Text style={styles.placeName}>Emergency contact</Text>
            <Icon name="chevron-right" size={20} color={Colors.secondaryText} />
          </PressableScale>
          <PressableScale
            style={styles.moreRow}
            onPress={() => router.push('/')}
            haptic>
            <View style={[styles.placeDot, { backgroundColor: Colors.brand }]}>
              <Icon
                name="information-outline"
                size={16}
                color={Colors.onAccent}
              />
            </View>
            <Text style={styles.placeName}>About Naga-Gentra</Text>
            <Icon name="chevron-right" size={20} color={Colors.secondaryText} />
          </PressableScale>
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.card
  },
  scrollContent: {
    paddingBottom: spacing.xl
  },
  header: {
    overflow: 'hidden',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.huge + spacing.md,
    gap: spacing.md
  },
  headerWave: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md
  },
  kicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.onAccentMuted,
    letterSpacing: LetterSpacing.display
  },
  greeting: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.heading,
    color: Colors.onAccent,
    marginTop: 2,
    lineHeight: LineHeight.heading
  },
  headerSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.onAccentSoft,
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentGlass,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentGlass
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 20
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.elevated
  },
  walletLabel: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase'
  },
  walletValue: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.price,
    color: Colors.primaryText,
    marginTop: 2
  },
  walletAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.brandSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  walletAddText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand
  },
  whereTo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.card
  },
  whereToIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  whereToText: {
    flex: 1,
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText
  },
  rebookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: Colors.accentGlass,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  rebookRowIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rebookRowWrap: {
    flex: 1,
    gap: 1
  },
  rebookRowLabel: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.onAccent,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase'
  },
  rebookRowRoute: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.small,
    color: Colors.onAccentSoft
  },
  body: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    gap: spacing.lg
  },
  sectionTitle: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase',
    marginBottom: spacing.md
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  tile: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs
  },
  tileLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.caption,
    color: Colors.primaryText,
    textAlign: 'center'
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: Colors.star,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card
  },
  bannerEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentGlass,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerEmojiText: {
    fontSize: 22
  },
  bannerTitle: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.body,
    color: Colors.onAccent
  },
  bannerBody: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.onAccentSoft,
    marginTop: 2
  },
  promoRow: {
    gap: spacing.md,
    paddingRight: spacing.xxl
  },
  promoCard: {
    width: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card
  },
  promoFill: {
    padding: spacing.lg,
    gap: 4
  },
  promoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accentGlass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs
  },
  promoTitle: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.onAccent
  },
  promoBody: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.onAccentSoft
  },
  promoCode: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentGlass,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginTop: spacing.sm
  },
  promoCodeText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.onAccent,
    letterSpacing: LetterSpacing.wide
  },
  sheetContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.huge
  },
  sheetTitle: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.title,
    color: Colors.primaryText,
    marginBottom: spacing.md
  },
  placeDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeName: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText
  },
  promoDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md
  },
  promoDetailBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  promoDetailTitle: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText
  },
  promoDetailBody: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    marginTop: 1
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm
  }
});
