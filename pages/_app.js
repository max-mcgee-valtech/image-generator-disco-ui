import "../styles/global.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import ApiProvider from "../pages/game/gameProvider";

export default function App({ Component, pageProps }) {
  return (
    <ApiProvider>
      <Component {...pageProps} />
    </ApiProvider>
  );
}
