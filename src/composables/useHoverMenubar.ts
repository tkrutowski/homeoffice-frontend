import { onMounted, type Ref } from 'vue';

/**
 * PrimeVue Menubar domyślnie wymaga kliknięcia, aby otworzyć pierwsze submenu — najechanie myszką
 * przełącza submenu dopiero, gdy jedno jest już otwarte (wewnętrzna flaga `dirty`). Biblioteka nie
 * udostępnia publicznego API dla trybu hover, więc ustawiamy `dirty` na starcie (submenu otwiera się
 * już od pierwszego najechania) i czyścimy `activeItemPath` przy opuszczeniu menu myszką.
 *
 * `menubarRef` musi być zadeklarowany lokalnie w komponencie (`const menubarRef = ref()`) i podpięty
 * w szablonie przez statyczne `ref="menubarRef"` — tylko ta forma poprawnie wiąże referencję do
 * instancji komponentu Menubar w momencie montowania.
 */
export function useHoverMenubar(menubarRef: Ref<any>) {
  onMounted(() => {
    if (menubarRef.value) {
      menubarRef.value.dirty = true;
    }
  });

  function onMenuMouseLeave() {
    if (menubarRef.value) {
      menubarRef.value.activeItemPath = [];
    }
  }

  return { onMenuMouseLeave };
}
