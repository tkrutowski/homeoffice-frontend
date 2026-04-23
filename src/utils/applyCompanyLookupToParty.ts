import type { Bank } from '@/types/Bank';
import type { CompanyLookupResult } from '@/types/CompanyLookup';
import type { Firm } from '@/types/Firm';

export type PartyFormModel = Firm | Bank;

/** Kod pocztowy w formularzu: `^\d{2}-\d{3}$` */
export function normalizePolishZip(zip: string): string {
  const trimmed = zip.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 5) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return trimmed;
}

function formatRegistryLines(result: CompanyLookupResult): string {
  const lines: string[] = [`NIP: ${result.nip}`];
  if (result.regon) {
    lines.push(`REGON: ${result.regon}`);
  }
  if (result.accountNumber) {
    lines.push(`Nr konta: ${result.accountNumber}`);
  }
  return lines.join('\n');
}

const registryMarker = '--- Rejestr ---';

/**
 * Uzupełnia nazwę i adres z wyniku lookup; nie zmienia `id` ani `address.id`.
 * Blok rejestrowy w `otherInfo` jest aktualizowany przy ponownym wyszukiwaniu.
 */
export function applyCompanyLookupToParty(party: PartyFormModel, result: CompanyLookupResult): void {
  party.name = result.name;
  party.address.street = result.addressDto.street ?? '';
  party.address.city = result.addressDto.city ?? '';
  party.address.zip = normalizePolishZip(result.addressDto.zip ?? '');

  const block = `${registryMarker}\n${formatRegistryLines(result)}`;
  const current = party.otherInfo ?? '';
  if (current.includes(registryMarker)) {
    party.otherInfo = current.replace(new RegExp(`${registryMarker}[\\s\\S]*$`), block);
  } else {
    party.otherInfo = current.trim() ? `${current.trim()}\n\n${block}` : block;
  }
}

/** Zwraca 10 cyfr lub `null` gdy NIP jest niepoprawny. */
export function parsePolishNipInput(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 10 ? digits : null;
}
