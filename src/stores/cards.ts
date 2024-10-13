import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { useAuthorizationStore } from "@/stores/authorization";
import { ErrorService } from "@/service/ErrorService";
import { ActiveStatus, Card } from "@/types/Bank";
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
    getCardsInactive: (state) => {
      return state.cards.filter((item) => item.activeStatus === "INACTIVE");
    },
    getCardsActive: (state) => {
      return state.cards.filter((item) => item.activeStatus === "ACTIVE");
    },
  },

  //actions = metody w komponentach
  actions: {
     getCardLogo(idCard: number) {
      // console.log("START - getCardLogo(", idCard, ")");
      let card = null;
      if (this.cards.length == 0){
         this.getCardsFromDb("ALL").then(() => {
         card = this.cards.find(value => value.id === idCard);

         })
      }else {
         card = this.cards.find(value => value.id === idCard);
      }
      return card ?card.imageUrl : card;
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
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(
          `/v1/finance/card?status=` + status,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
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
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(
          `/v1/finance/card/user/` + userId + `?status=` + status,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
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
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(`/v1/finance/card/` + cardId, {
          headers: authorization.accessToken !== "null" ? headers : {},
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
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.post(`/v1/finance/card`, card, {
          headers: authorization.accessToken !== "null" ? headers : {},
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
      console.log("START - updateCardDb()", card);

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.put(`/v1/finance/card`, card, {
          headers: authorization.accessToken !== "null" ? headers : {},
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
      try {
        await httpCommon.delete(`/v1/finance/card/` + cardId);
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
