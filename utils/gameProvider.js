import { useReducer, createContext } from "react";
import apiReducer from "./gameReducer";

const initialState = {
  game: {
    players: [],
    numQuestions: 1,
    currentStep: 0,
    steps: [],
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
