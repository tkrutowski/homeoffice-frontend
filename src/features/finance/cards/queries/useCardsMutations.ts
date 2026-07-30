import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { createCard, deleteCard, updateCard } from '@/features/finance/cards/api/cardsApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';
import type { Card } from '@/features/finance/cards/types';

export function useCreateCardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (card: Card) => createCard(card),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.cards.all() });
    },
  });
}

export function useUpdateCardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (card: Card) => updateCard(card),
    onSuccess: card => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.cards.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.cards.detail(card.id) });
    },
  });
}

export function useDeleteCardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: number) => deleteCard(cardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.cards.all() });
    },
  });
}
