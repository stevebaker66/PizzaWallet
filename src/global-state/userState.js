import { createState, useState } from "@hookstate/core";

const userState = createState({
  isUserLoggedIn: false,
});

export function useUserState() {
  const state = useState(userState);

  return {
    get isUserLoggedIn() {
      return state.isUserLoggedIn.get();
    },
    setIsUserLoggedIn(loggedIn) {
      state.isUserLoggedIn.set(loggedIn);
    },
  };
}
