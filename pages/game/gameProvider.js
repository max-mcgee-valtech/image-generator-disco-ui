import { useReducer, createContext } from "react";
import apiReducer from "./gameReducer";

const initialState = {
  users: { success: false, loading: false, error: false, data: [] },
  game: {
    players: [],
    numQuestions: 1,
    currentStep: 0,
    steps: [
      {
        imageUrl: "",
        questions: [{ text: "", isCorrect: false }],
      },
    ],
  },
};

export const ApiContext = createContext();

const ApiProvider = ({ children }) => {
  const [state, dispatch] = useReducer(apiReducer, initialState);

  return (
    <ApiContext.Provider value={{ state, dispatch }}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;
