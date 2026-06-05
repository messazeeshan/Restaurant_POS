import React from 'react';
import { LOYALTY_TIER, LOYALTY_TIER_COLORS, LOYALTY_TIER_THRESHOLDS } from '../../data/constants.js';
import { formatCurrency } from '../../utils/formatters.js';

/**
 * LoyaltyWidget — shows loyalty tier and points progress bar
 * @param {{ customer: object }} props
 */
export default function LoyaltyWidget({ customer }) {
  if (!customer) return null;

  const { loyaltyPoints = 0, lifetimeSpend = 0, tier = LOYALTY_TIER.BRONZE } = customer;
  const tierColor = LOYALTY_TIER_COLORS[tier];

  // Progress to next tier
  const tiers = [LOYALTY_TIER.BRONZE, LOYALTY_TIER.SILVER, LOYALTY_TIER.GOLD];
  const tierIndex = tiers.indexOf(tier);
  const nextTier = tiers[tierIndex + 1];
  const nextThreshold = nextTier ? LOYALTY_TIER_THRESHOLDS[nextTier] : null;
  const currentThreshold = LOYALTY_TIER_THRESHOLDS[tier];
  const progress = nextThreshold
    ? Math.min(((lifetimeSpend - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
    : 100;

  return (
    <div style={{ background: 'var(--bg-elevated)', border: `1px solid ${tierColor}30`, borderRadius: 'var(--radius)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Tier badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
            Loyalty Status
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: tierColor }}>
            {tier} Member
          </div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: `${tierColor}20`, border: `2px solid ${tierColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          {tier === LOYALTY_TIER.GOLD ? '🥇' : tier === LOYALTY_TIER.SILVER ? '🥈' : '🥉'}
        </div>
      </div>

      {/* Points */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Points Balance</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: tierColor }}>{loyaltyPoints.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lifetime Spend</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{formatCurrency(lifetimeSpend)}</div>
        </div>
      </div>

      {/* Progress bar */}
      {nextTier && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>{tier}</span>
            <span>{nextTier} at {formatCurrency(nextThreshold)}</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${tierColor}, ${tierColor}CC)`,
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.8s ease',
            }} />
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            {formatCurrency(nextThreshold - lifetimeSpend)} to {nextTier}
          </div>
        </div>
      )}

      {tier === LOYALTY_TIER.GOLD && (
        <div style={{ textAlign: 'center', fontSize: 12, color: tierColor, fontWeight: 600 }}>
          ⭐ Maximum tier achieved!
        </div>
      )}
    </div>
  );
}
