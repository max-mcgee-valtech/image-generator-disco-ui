const apiReducer = (state = {}, action) => {
  switch (action.type) {
    case "UPDATE_NUM_QUESTIONS":
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
      console.log("increment me");
      return {
        ...state,
        game: { ...state.game, currentStep: state.game.currentStep + 1 },
      };

    case "RESET_GAME":
      return {
        ...state,
        game: { ...state.game, currentStep: 0, currentGameScore: 0 },
      };

    case "INCREMENT_CURRENT_GAME_POINTS":
      return {
        ...state,
        game: {
          ...state.game,
          currentGameScore: state.game.currentGameScore + 1,
        },
      };

    default:
      return state;
  }
};

export default apiReducer;
