import React, { useState, useEffect } from "react";
import cloudinary from "cloudinary";
import {
  Grid,
  Box,
  ImageListItem,
  ImageList,
  ImageListItemBar,
  Skeleton,
  TextField,
} from "@mui/material";
import styled from "styled-components";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import Layout from "../components/layout";
import {
  StyledButton,
  ImageWrapper,
} from "../components/sharedStyledComponents";

const MainImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  border-radius: 6px;

  @media screen and (max-width: 600px) {
    padding: 1rem 0;
  }
`;

const MainImage = styled.img`
  cursor: pointer;
  width: 100%;
  max-width: 600px;
  max-height: 392px;
  height: auto;
  border-radius: 6px;
`;

const AboutSection = styled.div`
  width: 800px;
  padding-top: 4rem;
  line-height: 26px;
  @media screen and (max-width: 600px) {
    width: 100%;
  }
`;

export const Caption = styled.div`
  max-width: 600px;
  line-height: 1.5;
  padding-top: 2rem;
  @media screen and (max-width: 600px) {
    max-width: 300px;
  }
`;

export async function getServerSideProps(context) {
  cloudinary.config({
    cloud_name: "detzng4ks",
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  const images = await cloudinary.v2.search
    .expression("folder=disco-diffusion-active-tests")
    .sort_by("created_at", "desc")
    .with_field("context")
    .execute()
    .then((result) => {
      return {
        images: result.resources,
      };
    });

  return {
    props: { images },
  };
}

export default function Home(props) {
  const [recentImages, setRecentImages] = useState([]);
  const [textInput, setTextInput] = useState("");

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  };

  useEffect(() => {
    setRecentImages(props.images.images.slice(0, 10));
  }, props.images);

  const handleSubmit = async () => {
    setTextInput("");
    await fetch("/api/generate-image-disco", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ textPrompt: textInput, status: "pending" }),
    });
    setTimeout(async () => {
      const updateImages = await fetch("/api/fetch-recent-images", {
        method: "GET",
      });
      const finalUpdatedImages = await updateImages.json();
      setRecentImages(finalUpdatedImages.images.slice(0, 10));
    }, 2000);
  };

  return (
    <Layout>
      <div className="container">
        <Head>
          <title>Pixel Machine</title>
          <meta
            http-equiv="Content-Security-Policy"
            content="upgrade-insecure-requests"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <div>
            <Box sx={{ width: "100%" }}>
              <ImageWrapper>
                <Image
                  src="/FS_Logo_Black.png"
                  layout="fill"
                  objectFit="contain"
                />
              </ImageWrapper>
              {recentImages[0] && (
                <Link href={`/view/${recentImages[0].filename}`}>
                  <MainImageContainer>
                    {recentImages[0].context.alt === "pending" ? (
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          height: 392,
                          width: 600,
                          borderRadius: "6px",
                          "@media (max-width: 600px)": {
                            height: 200,
                            width: 345,
                          },
                        }}
                      />
                    ) : (
                      <MainImage
                        src={`${recentImages[0].url}?w=164&h=164&fit=crop&auto=format`}
                      />
                    )}

                    <Caption>{recentImages[0].context.caption}</Caption>
                  </MainImageContainer>
                </Link>
              )}
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                rowSpacing={2}
                columnSpacing={{ xs: 3, sm: 3, md: 3 }}
              >
                <Grid
                  item
                  sx={{
                    width: "300px",
                    display: "flex",
                    "@media (max-width: 768px)": {
                      width: "90%",
                      display: "flex",
                      justifyContent: "center",
                    },
                  }}
                >
                  <TextField
                    id={"outlined-textarea"}
                    label={"Enter a Sentence"}
                    placeholder={"Placeholder"}
                    value={textInput}
                    multiline
                    onChange={handleTextInputChange}
                    sx={{
                      color: "black",
                      borderColor: "black",
                      backgroundColor: "white",
                      width: "300px",
                      ":hover": {
                        color: "black",
                      },
                      "@media (max-width: 600px)": {
                        width: "100%",
                      },
                    }}
                  />
                </Grid>
                <Grid item>
                  <StyledButton
                    type={"submit"}
                    variant={"contained"}
                    color={"primary"}
                    onClick={handleSubmit}
                    sx={{
                      backgroundColor: "black",
                      ":hover": {
                        backgroundColor: "black",
                      },
                    }}
                  >
                    Submit
                  </StyledButton>
                </Grid>
              </Grid>
              <AboutSection>
                Pixel Machine is a tool empowering users to create AI-generated
                Art. Recent improvements in diffusion models allow users to
                created high-quality synthetic images matching text prompts.
                Using the{" "}
                <a
                  href="https://github.com/alembics/disco-diffusion"
                  target="_blank"
                  style={{ color: "black" }}
                >
                  Disco Diffusion
                </a>{" "}
                model, text prompts are converted into images through 250 steps
                of diffusion iterations.
                <br />
                <br />
                To create an image, enter a creative text prompt. Try to be as
                descriptive as possible.{" "}
                <a
                  href="https://weirdwonderfulai.art/resources/disco-diffusion-modifiers/"
                  target="_blank"
                  style={{ color: "black" }}
                >
                  Check out these modifier examples
                </a>{" "}
                for inspiration as you create your prompt. It currently takes
                about 10 minutes to generate a new image. While you are waiting,
                play the{" "}
                <a href="/game" style={{ color: "black" }}>
                  Pixel Machine game
                </a>{" "}
                to test your AI guessing abilities.
              </AboutSection>
              <ImageList cols={3} gap={8}>
                {recentImages.slice(1, 10).map((item) => {
                  return (
                    <Link href={`/view/${item.filename}`} key={item.filename}>
                      <ImageListItem key={item.url} sx={{ cursor: "pointer" }}>
                        {item.context.alt === "pending" ? (
                          <Skeleton
                            variant="rectangular"
                            sx={{
                              height: 160,
                              borderRadius: "6px",
                              "@media (max-width: 600px)": {
                                height: 97,
                              },
                            }}
                          />
                        ) : (
                          <img
                            src={`${item.url}?w=164&h=164&fit=crop&auto=format`}
                            srcSet={`${item.url}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                            loading="lazy"
                          />
                        )}
                        {item.context && (
                          <ImageListItemBar
                            title={item.context ? item.context.caption : ""}
                            position="below"
                            sx={{ fontFamily: "FuturaStdBook" }}
                          />
                        )}
                      </ImageListItem>
                    </Link>
                  );
                })}
              </ImageList>
            </Box>
          </div>
        </main>

        <style jsx>{`
          .container {
            min-height: 100vh;
            padding: 0 0.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-size: 8px 8px;
            background-image: linear-gradient(
                90deg,
                #f5f5f5 6px,
                transparent 1%
              ),
              linear-gradient(#f5f5f5 6px, transparent 1%);
            background-color: #e0dad3;
          }
        `}</style>
      </div>
    </Layout>
  );
}
