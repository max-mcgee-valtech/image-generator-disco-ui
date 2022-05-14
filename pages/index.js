import React, { useState } from "react";
import cloudinary from "cloudinary";
import {
  Button,
  Stack,
  Grid,
  Box,
  ImageListItem,
  ImageList,
} from "@mui/material";

import Head from "next/head";
import Layout from "../components/layout";
import TextField from "@mui/material/TextField";

export async function getServerSideProps(context) {
  let image;
  cloudinary.config({
    cloud_name: "detzng4ks",
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  const images = await cloudinary.v2.search
    .expression("folder=disco-diffusion-active-tests")
    .sort_by("uploaded_at", "desc")
    .with_field("context")
    .execute()
    .then((result) => {
      console.log("RES");
      return {
        images: result.resources,
      };
    });

  return {
    props: { images }, // will be passed to the page component as props
  };
}

export default function Home(props) {
  const images = props.images.images.slice(0, 9);
  console.log(images);
  const [textInput, setTextInput] = useState("");

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  };

  const handleSubmit = async () => {
    const response = await fetch("/api/generate-image-disco", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ textPrompt: textInput }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    setTextInput("");
  };

  return (
    <Layout>
      <div className="container">
        <Head>
          <meta
            http-equiv="Content-Security-Policy"
            content="upgrade-insecure-requests"
          />
          <title>Create Next App</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <div>
            <Box sx={{ width: "100%" }}>
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                rowSpacing={3}
                columnSpacing={{ xs: 3, sm: 3, md: 3 }}
              >
                <Grid item>
                  <TextField
                    id={"outlined-textarea"}
                    label={"Multiline Placeholder"}
                    placeholder={"Placeholder"}
                    value={textInput}
                    multiline
                    onChange={handleTextInputChange}
                  />
                </Grid>
                <Grid item>
                  <Button
                    type={"submit"}
                    variant={"contained"}
                    color={"primary"}
                    onClick={() => {
                      handleSubmit();
                    }}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
              <ImageList
                gap={10}
                sx={{ width: 500, height: 500 }}
                cols={3}
                rowHeight={164}
              >
                {images.map((item) => (
                  <ImageListItem key={item.url}>
                    <img
                      src={`${item.url}?w=164&h=164&fit=crop&auto=format`}
                      srcSet={`${item.url}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                      loading="lazy"
                    />
                  </ImageListItem>
                ))}
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
