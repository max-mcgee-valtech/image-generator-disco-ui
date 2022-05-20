const apiReducer = (state = {}, action) => {
  switch (action.type) {
    case "UPDATE_NUM_QUESTIONS":
      console.log("...state", state);
      return {
        ...state,
        game: { ...state.game, numQuestions: action.payload },
      };
    case "SET_GAME_STEPS":
      return {
        ...state,
        game: { ...state.game, steps: action.payload },
      };
    case "INCREMENT_CURRENT_STEP":
      return {
        ...state,
        game: { ...state.game, currentStep: state.game.currentStep + 1 },
      };

    default:
      return state;
  }
};

export default apiReducer;
