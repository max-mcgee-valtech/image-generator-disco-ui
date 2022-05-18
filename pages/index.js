import React, { useState, useEffect } from "react";
import cloudinary from "cloudinary";
import {
  Button,
  Stack,
  Grid,
  Box,
  ImageListItem,
  ImageList,
  ImageListItemBar,
  Skeleton,
} from "@mui/material";
import styled from "styled-components";

import Head from "next/head";
import Link from "next/link";

import Layout from "../components/layout";
import TextField from "@mui/material/TextField";

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

export const Caption = styled.div`
  max-width: 600px;
  line-height: 1.5;
  padding-top: 2rem;
`;

export const SkeletonContainerDesktop = styled.div`
  @media screen and (max-width: 600px) {
    display: none;
  }
`;

export const SkeletonContainerMobile = styled.div`
  @media screen and (min-width: 600px) {
    display: none;
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
      console.log("final ", finalUpdatedImages);
      setRecentImages(finalUpdatedImages.images.slice(0, 10));
    }, 2000);
  };

  console.log(recentImages[0]);

  return (
    <Layout>
      <div className="container">
        <Head>
          <meta
            http-equiv="Content-Security-Policy"
            content="upgrade-insecure-requests"
          />
          <title>Image Alchemist</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <div>
            <Box sx={{ width: "100%" }}>
              {recentImages[0] && (
                <Link href={`/view/${recentImages[0].filename}`}>
                  <MainImageContainer>
                    {recentImages[0].context.alt === "pending" ? (
                      <>
                        <SkeletonContainerDesktop>
                          <Skeleton
                            variant="rectangular"
                            width={600}
                            height={392}
                          />
                        </SkeletonContainerDesktop>
                        <SkeletonContainerMobile>
                          <Skeleton
                            variant="rectangular"
                            width={320}
                            height={200}
                          />
                        </SkeletonContainerMobile>
                      </>
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
                      width: "80%",
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
                      width: "300px",
                      ":hover": {
                        color: "black",
                      },
                      "@media (max-width: 768px)": {
                        width: "80%",
                      },
                    }}
                  />
                </Grid>
                <Grid item>
                  <Button
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
                  </Button>
                </Grid>
              </Grid>
              <ImageList cols={3} gap={8}>
                {recentImages.slice(1, 10).map((item) => {
                  return (
                    <Link href={`/view/${item.filename}`} key={item.filename}>
                      <ImageListItem key={item.url} sx={{ cursor: "pointer" }}>
                        {item.context.alt === "pending" ? (
                          <Skeleton
                            variant="rectangular"
                            width={260}
                            height={160}
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
          }

          a {
            color: inherit;
            text-decoration: none;
          }
        `}</style>
      </div>
    </Layout>
  );
}
