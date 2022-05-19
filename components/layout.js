import Head from "next/head";

import ApiProvider from "../pages/game/gameProvider";

export default function Layout({ children }) {
  return (
    <ApiProvider>
      <div>
        {" "}
        <Head>
          <link
            rel="preload"
            href="/fonts/FuturaStd-Heavy.otf"
            as="font"
            crossOrigin=""
          />
          <link
            rel="preload"
            href="/fonts/FuturaStd-Light.otf"
            as="font"
            crossOrigin=""
          />
          <link
            rel="preload"
            href="/fonts/FuturaStdBook.otf"
            as="font"
            crossOrigin=""
          />
        </Head>
        {children}{" "}
      </div>
    </ApiProvider>
  );
}
