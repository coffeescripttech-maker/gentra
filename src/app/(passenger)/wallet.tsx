import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedNumber } from '@/components/ui/animated-number';
import { BackButton } from '@/components/ui/back-button';
import { EmptyState } from '@/components/ui/empty-state';
import { FadeInView } from '@/components/ui/fade-in-view';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LetterSpacing, LineHeight } from '@/constants/typography';
import { useSession } from '@/context/session';
import { formatPeso } from '@/utils/fare';
import { hapticSuccess } from '@/utils/haptics';

const QUICK_TOPUPS = [50, 100, 250, 500] as const;

/** Below this balance the top-up section shows a low-balance nudge. */
const LOW_BALANCE_THRESHOLD = 150;

interface WalletTx {
  id: string;
  kind: 'topup' | 'tricycle' | 'jeepney';
  title: string;
  sub: string;
  amount: number; // + credit, − debit
  date: Date;
}

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

/** Day bucket label for the activity feed — Today / Yesterday / Earlier. */
function bucketLabel(d: Date): string {
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return 'Earlier';
}

function amountIcon(kind: WalletTx['kind']): IconName {
  if (kind === 'topup') return 'wallet-plus';
  return kind === 'jeepney' ? 'bus' : 'motorbike';
}

export default function WalletScreen() {
  const { state, addFunds } = useSession();
  const [recentTopUps, setRecentTopUps] = useState<Array<{ id: string; amount: number; at: string }>>([]);

  const topUp = (amount: number) => {
    addFunds(amount);
    setRecentTopUps((prev) => [
      {
        id: `topup-${Date.now()}-${prev.length}`,
        amount,
        at: new Date().toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }),
      },
      ...prev,
    ]);
    hapticSuccess();
  };

  const transactions: WalletTx[] = [
    ...recentTopUps.map((t) => ({
      id: t.id,
      kind: 'topup' as const,
      title: 'Wallet top-up',
      sub: t.at,
      amount: t.amount,
      date: new Date(),
    })),
    ...state.receipts.map((r) => ({
      id: r.id,
      kind: (r.vehicleType === 'jeepney' ? 'jeepney' : 'tricycle') as WalletTx['kind'],
      title: `${r.pickup} → ${r.destination}`,
      sub: `${r.driverName} · ${fmtDate(r.date)}`,
      amount: -(r.fare + r.tip),
      date: new Date(`${r.date}T00:00:00`),
    })),
  ];

  // Bucket transactions into Today / Yesterday / Earlier, in that order.
  const groups = useMemo(() => {
    const order: Record<string, number> = { Today: 0, Yesterday: 1, Earlier: 2 };
    const byBucket = new Map<string, WalletTx[]>();
    transactions.forEach((tx) => {
      const label = bucketLabel(tx.date);
      const bucket = byBucket.get(label);
      if (bucket) bucket.push(tx);
      else byBucket.set(label, [tx]);
    });
    return Array.from(byBucket.entries()).sort((a, b) => order[a[0]] - order[b[0]]);
  }, [transactions]);

  const lowBalance = state.walletBalance <= LOW_BALANCE_THRESHOLD;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Balance hero */}
        <LinearGradient
          colors={Colors.brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroHeader}>
            <BackButton inverse />
            <Text style={styles.heroTitle}>Wallet</Text>
            <View style={styles.heroSpacer} />
          </View>
          <Text style={styles.kicker}>WALLET BALANCE</Text>
          <AnimatedNumber
            value={state.walletBalance}
            duration={700}
            format={(v) => formatPeso(Math.round(v))}
            style={styles.balance}
          />
          <Text style={styles.heroCaption}>Cash · GCash · Maya</Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Top-up */}
          <FadeInView>
            <Text style={styles.sectionTitle}>Top up wallet</Text>
            <View style={styles.chipRow}>
              {QUICK_TOPUPS.map((amount) => (
                <PressableScale
                  key={amount}
                  style={styles.chip}
                  onPress={() => topUp(amount)}
                  haptic>
                  <Text style={styles.chipText}>+₱{amount}</Text>
                </PressableScale>
              ))}
            </View>
            {lowBalance && (
              <FadeInView style={styles.lowBalance}>
                <Icon name="alert" size={18} color={Colors.warning} />
                <Text style={styles.lowBalanceText}>
                  Balance is getting low — top up to keep rides flowing.
                </Text>
              </FadeInView>
            )}
          </FadeInView>

          {/* Activity */}
          <FadeInView>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            {transactions.length === 0 ? (
              <EmptyState
                icon="wallet-outline"
                title="No transactions yet"
                body="Top-ups and ride payments will show up here."
              />
            ) : (
              <View style={styles.listCard}>
                {groups.map(([label, txs], gi) => (
                  <View key={label}>
                    <Text style={styles.groupHeader}>{label.toUpperCase()}</Text>
                    {txs.map((tx, ti) => {
                      const credit = tx.amount > 0;
                      const isLast = gi === groups.length - 1 && ti === txs.length - 1;
                      const tint = credit ? Colors.success : tx.kind === 'jeepney' ? Colors.driver : Colors.brand;
                      return (
                        <View
                          key={tx.id}
                          style={[styles.txRow, isLast && styles.txRowLast]}>
                          <View style={[styles.txBadge, { backgroundColor: `${tint}1A` }]}>
                            <Icon name={amountIcon(tx.kind)} size={18} color={tint} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.txTitle}>{tx.title}</Text>
                            <Text style={styles.txSub}>{tx.sub}</Text>
                          </View>
                          <Text style={[styles.txAmount, credit ? styles.txCredit : styles.txDebit]}>
                            {credit ? '+' : '−'}
                            {formatPeso(Math.abs(tx.amount))}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}
          </FadeInView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  /** Keeps the hero full-bleed while everything below shares the home gutter. */
  body: {
    paddingHorizontal: spacing.xxl,
  },
  hero: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  heroSpacer: {
    width: 40,
  },
  heroTitle: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.title,
    color: Colors.onAccent,
  },
  kicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.onAccentMuted,
    letterSpacing: LetterSpacing.display,
  },
  balance: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.displayLarge,
    color: Colors.onAccent,
    marginTop: spacing.xs,
  },
  heroCaption: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.onAccentSoft,
  },
  sectionTitle: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    ...shadows.card,
  },
  chipText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.brand,
  },
  lowBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  lowBalanceText: {
    flex: 1,
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    lineHeight: LineHeight.caption,
  },
  listCard: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    ...shadows.card,
  },
  groupHeader: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  txRowLast: {
    borderBottomWidth: 0,
  },
  txBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.small,
    color: Colors.primaryText,
  },
  txSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    marginTop: 1,
  },
  txAmount: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.small,
  },
  txCredit: {
    color: Colors.success,
  },
  txDebit: {
    color: Colors.primaryText,
  },
});