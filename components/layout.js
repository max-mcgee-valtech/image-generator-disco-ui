import Head from "next/head";
import styled from "styled-components";

const Container = styled.div`
  height: 100%;
  background-size: 8px 8px;
  background-image: linear-gradient(90deg, #f5f5f5 6px, transparent 1%),
    linear-gradient(#f5f5f5 6px, transparent 1%);
  background-color: #e0dad3;
  min-height: 1024px;
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
