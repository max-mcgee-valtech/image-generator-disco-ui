import Head from "next/head";
import styled from "styled-components";

const Container = styled.div`
  height: 100%;
`;

export default function Layout({ children }) {
  return (
    <Container>
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
    </Container>
  );
}
