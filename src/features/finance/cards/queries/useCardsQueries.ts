import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchCard, fetchCards, fetchCardsByUser } from '@/features/finance/cards/api/cardsApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';
import type { ActiveStatus } from '@/features/finance/cards/types';

export function useCardsListQuery(status: MaybeRefOrGetter<ActiveStatus> = 'ALL') {
  return useQuery({
    queryKey: computed(() => financeKeys.cards.list(toValue(status))),
    queryFn: () => fetchCards(toValue(status)),
  });
}

export function useCardsByUserQuery(
  userId: MaybeRefOrGetter<number>,
  status: MaybeRefOrGetter<ActiveStatus> = 'ALL',
  enabled: MaybeRefOrGetter<boolean> = true
) {
  return useQuery({
    queryKey: computed(() => financeKeys.cards.byUser(toValue(userId), toValue(status))),
    queryFn: () => fetchCardsByUser(toValue(userId), toValue(status)),
    enabled: computed(() => toValue(enabled) && toValue(userId) > 0),
  });
}

export function useCardQuery(cardId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => financeKeys.cards.detail(toValue(cardId))),
    queryFn: () => fetchCard(toValue(cardId)),
    enabled: computed(() => toValue(enabled) && toValue(cardId) > 0),
  });
}
