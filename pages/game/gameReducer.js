const apiReducer = (state = {}, action) => {
  switch (action.type) {
    case "UPDATE_NUM_QUESTIONS":
      console.log("...state", state);
      return {
        ...state,
        game: { ...state.game, numQuestions: 2 },
      };
    case "FETCH_USERS_SUCCESS":
      return {
        ...state,
        users: {
          success: true,
          loading: true,
          error: false,
          data: action.payload.data,
        },
      };
    case "FETCH_USERS_ERROR":
      return {
        ...state,
        users: { success: false, loading: false, error: true, data: [] },
      };

    default:
      return state;
  }
};

export default apiReducer;
