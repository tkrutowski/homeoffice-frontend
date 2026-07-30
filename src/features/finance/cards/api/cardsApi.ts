import moment from 'moment';
import httpCommon from '@/config/http-common';
import type { ActiveStatus } from '@/types/ActiveStatus';
import type { Card } from '@/features/finance/cards/types';

function normalizeCard(card: Card): Card {
  return {
    ...card,
    activationDate: card.activationDate ? new Date(card.activationDate) : null,
    expirationDate: card.expirationDate ? new Date(card.expirationDate) : null,
  };
}

function toCardPayload(card: Card) {
  return {
    ...card,
    activationDate: card.activationDate ? moment(card.activationDate).format('YYYY-MM-DD') : null,
    expirationDate: card.expirationDate ? moment(card.expirationDate).format('YYYY-MM-DD') : null,
  };
}

export async function fetchCards(status: ActiveStatus): Promise<Card[]> {
  const response = await httpCommon.get(`/v1/finance/card?status=${status}`);
  return (response.data ?? []).map(normalizeCard);
}

export async function fetchCardsByUser(userId: number, status: ActiveStatus): Promise<Card[]> {
  const response = await httpCommon.get(`/v1/finance/card/user/${userId}?status=${status}`);
  return (response.data ?? []).map(normalizeCard);
}

export async function fetchCard(cardId: number): Promise<Card | null> {
  const response = await httpCommon.get(`/v1/finance/card/${cardId}`);
  return response.data ? normalizeCard(response.data) : null;
}

export async function createCard(card: Card): Promise<Card> {
  const response = await httpCommon.post(`/v1/finance/card`, toCardPayload(card));
  return normalizeCard(response.data);
}

export async function updateCard(card: Card): Promise<Card> {
  const response = await httpCommon.put(`/v1/finance/card`, toCardPayload(card));
  return normalizeCard(response.data);
}

export async function deleteCard(cardId: number): Promise<void> {
  await httpCommon.delete(`/v1/finance/card/${cardId}`);
}

export function findCardById(cards: Card[], cardId: number): Card | null {
  return cards.find(card => card.id === cardId) ?? null;
}

export function filterCardsByUser(cards: Card[], userId: number): Card[] {
  return cards.filter(card => card.idUser === userId || card.multi);
}

export function filterCardsByUserAndStatus(cards: Card[], userId: number, status: ActiveStatus): Card[] {
  return cards.filter(card => (card.idUser === userId || card.multi) && card.activeStatus === status);
}
