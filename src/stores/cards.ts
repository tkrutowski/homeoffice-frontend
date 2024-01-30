import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { useAuthorizationStore } from "@/stores/authorization";
import { ErrorService } from "@/service/ErrorService";
import { ActiveStatus, Card } from "@/assets/types/Bank";
import cardAlfa from "/src/assets/images/alfa_card.png";
import cardMillennium from "@/assets/images/millenium_card.png";
import cardAllegro from "@/assets/images/allegro_card.png";
import cardSaturn from "@/assets/images/saturn_card.png";
import cardPkoBp from "@/assets/images/pkoBp_card.png";
import User from "@/assets/types/User";
export const useCardsStore = defineStore("card", {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingCards: false,

    cards: [] as Card[],
  }),

  //getters = computed
  getters: {
    // getSortedInvoices: (state) =>
    //   state.invoices.sort((a, b) => a.idInvoice - b.idInvoice),
  },

  //actions = metody w komponentach
  actions: {
    getCardLogo(idCard: number) {
      console.log("START - getCardLogo(", idCard, ")");
      let result;
      switch (idCard) {
        case 2:
          // console.log('SATURN');
          result = cardSaturn;
          break;
        case 3:
        case 8:
          // console.log('ALFA');
          result = cardAlfa;
          break;
        case 4:
        case 5:
          // console.log('PKO_BP');
          result = cardPkoBp;
          break;
        case 6:
          // console.log('DEBET');
          result = cardMillennium;
          break;
        case 7:
          // console.log('ALLEGRO');
          result = cardAllegro;
          break;
        default:
          console.log("Number is not 1, 2, or 3");
          break;
      }

      return result;
    },
    //
    //Get card by id
    //
    getCard(idCard: number): Card | undefined {
      const card = this.cards.find((card) => card.id === idCard);
      if (card) return card;
      else return undefined;
    },
    getCardByUser(idUser: number): Card[] {
      return this.cards.filter((card) => card.idUser === idUser);
    },
    getCardByUserAndStatus(idUser: number, status: ActiveStatus): Card[] {
      return this.cards.filter(
        (card) => card.idUser === idUser && card.activeStatus === status
      );
    },
    //----------------------------------------DB-------------------------------------------------------
    //
    //GET CARDS
    //
    async getCardsFromDb(status: ActiveStatus): Promise<void> {
      console.log("START - getCardsFromDb(", status, ")");
      this.loadingCards = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.get(
          `/finance/card?status=` + status,
          {
            headers: authorization.token !== "null" ? headers : {},
          }
        );
        console.log("getCardsFromDb() - Ilosc[]: " + response.data.length);
        this.cards = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getBanksFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingCards = false;
        console.log("END - getCardsFromDb()");
      }
    },

    //
    //GET CARDS
    //
    async getCardsByUserFromDb(
      userId: number,
      status: ActiveStatus
    ): Promise<void> {
      console.log("START - getCardsByUserFromDb(", userId, ", ", status, ")");
      this.loadingCards = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.get(
          `/finance/card/user/` + userId + `?status=` + status,
          {
            headers: authorization.token !== "null" ? headers : {},
          }
        );
        console.log(
          "getCardsByUserFromDb() - Ilosc[]: " + response.data.length
        );
        this.cards = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getCardsByUserFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingCards = false;
        console.log("END - getCardsFromDb()");
      }
    },

    //
    //GET  CARD FROM DB BY ID
    //
    async getCardFromDb(cardId: number): Promise<Card | undefined> {
      console.log("START - getCardFromDb(" + cardId + ")");
      this.loadingCards = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.get(`/finance/card/` + cardId, {
          headers: authorization.token !== "null" ? headers : {},
        });
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getCardFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingCards = false;
        console.log("END - getCardFromDb()");
      }
    },
    //
    //ADD CARD
    //
    async addCardDb(card: Card) {
      console.log("START - addCardDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.post(`/finance/card`, card, {
          headers: authorization.token !== "null" ? headers : {},
        });
        this.cards.push(response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR addCardDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - addCardDb()");
      }
    },
    //
    //UPDATE CARD
    //
    async updateCardDb(card: Card) {
      console.log("START - updateCardDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.put(`/finance/card`, card, {
          headers: authorization.token !== "null" ? headers : {},
        });
        const index = this.cards.findIndex((b) => b.id === card.id);
        if (index !== -1) this.cards.splice(index, 1, response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateCardDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updateCardDb()");
      }
    },
    //
    //DELETE CARD
    //
    async deleteCardDb(cardId: number) {
      console.log("START - deleteCardDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        await httpCommon.delete(`/finance/card/` + cardId, {
          headers: authorization.token !== "null" ? headers : {},
        });
        const index = this.cards.findIndex((b) => b.id === cardId);
        if (index !== -1) this.cards.splice(index, 1);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR deleteCardDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - deleteCardDb()");
      }
    },
  },
});
