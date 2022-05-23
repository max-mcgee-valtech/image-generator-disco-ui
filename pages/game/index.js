import React, { useState, useEffect, useContext } from "react";
import cloudinary from "cloudinary";
import {
  Stack,
  Grid,
  Box,
  ImageListItem,
  ImageList,
  ImageListItemBar,
  Skeleton,
  FormHelperText,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  FormControlLabel,
} from "@mui/material";
import styled from "styled-components";

import Head from "next/head";

import Layout from "../../components/layout";
import { ApiContext } from "../../utils/gameProvider";

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

const QuizFormWrapper = styled.form`
  display: flex;
  justify-content: center;
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
  @media screen and (max-width: 600px) {
    max-width: 300px;
  }
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

export default function Game(props) {
  const { state, dispatch } = useContext(ApiContext);

  const [recentImages, setRecentImages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [numQuestions, setNumQuestions] = React.useState(0);
  //   const [game, setGame] = useState({
  //     currentStep: 0,
  //   });
  useEffect(() => {
    console.log(state);
  }, [state]);
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState("Choose wisely");

  const handleRadioChange = (event) => {
    setValue(event.target.value);
    setHelperText(" ");
    setError(false);
  };

  const handleSubmitQuestion = (event) => {
    event.preventDefault();

    if (value == state.game.steps[state.game.currentStep].correctTextPrompt) {
      setHelperText("You got it!");
      setError(false);
    } else {
      setHelperText("Sorry, wrong answer!");
      setError(false);
    }

    setTimeout(() => {
      setValue("");
      dispatch({
        type: "INCREMENT_CURRENT_STEP",
      });
    }, 3000);
  };

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  };

  useEffect(() => {
    console.log(props.images.images);
    console.log(numQuestions);
    setRecentImages(props.images.images.slice(0, numQuestions));
  }, [numQuestions]);

  const handleSubmit = async () => {
    const listOfPlayers = textInput.split(",");
    const numQuestions = listOfPlayers.length * 3;
    dispatch({
      type: "UPDATE_NUM_QUESTIONS",
      payload: numQuestions,
    });

    const shuffled = props.images.images
      .filter((img) => img.context?.caption)
      .sort(() => 0.5 - Math.random());
    let imagesWithCaptions = shuffled.slice(0, numQuestions);

    const shuffledCaptions = props.images.images
      .filter((img) => img.context?.caption)
      .map((captionImg) => captionImg.context.caption);

    const cleanedImages = imagesWithCaptions.map((image) => {
      if (image.context?.caption) {
        return {
          filename: image.filename,
          currentStep: 1,
          url: image.url,
          correctTextPrompt: image.context?.caption ?? "",
          options: shuffledCaptions
            .slice(0, 3)
            .concat(image.context?.caption ?? "")
            .sort(() => 0.5 - Math.random()),
        };
      }
    });

    dispatch({
      type: "SET_GAME_STEPS",
      payload: cleanedImages,
    });
    dispatch({
      type: "INCREMENT_CURRENT_STEP",
    });
  };

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
              {state.game.steps[state.game.currentStep] && (
                <MainImageContainer>
                  <MainImage
                    src={`${
                      state.game.steps[state.game.currentStep].url
                    }?w=164&h=164&fit=crop&auto=format`}
                  />
                </MainImageContainer>
              )}
              {state.game.currentStep === 0 && (
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
                      label={"Enter Player Full Names, Separated By Comma"}
                      placeholder={
                        "Enter Player Full Names, Separated By Comma"
                      }
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
              )}
              {state.game.currentStep > 0 && (
                <QuizFormWrapper onSubmit={handleSubmitQuestion}>
                  <FormControl sx={{ m: 3 }} error={error} variant="standard">
                    <FormLabel id="demo-error-radios">
                      Select your best guess at the prompt used to create the
                      image:
                    </FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-error-radios"
                      name="quiz"
                      value={value}
                      onChange={handleRadioChange}
                    >
                      <FormControlLabel
                        value={
                          state.game.steps[state.game.currentStep].options[0]
                        }
                        label={
                          state.game.steps[state.game.currentStep].options[0]
                        }
                        control={<Radio />}
                      />
                      <FormControlLabel
                        value={
                          state.game.steps[state.game.currentStep].options[1]
                        }
                        label={
                          state.game.steps[state.game.currentStep].options[1]
                        }
                        control={<Radio />}
                      />
                      <FormControlLabel
                        value={
                          state.game.steps[state.game.currentStep].options[2]
                        }
                        label={
                          state.game.steps[state.game.currentStep].options[2]
                        }
                        control={<Radio />}
                      />
                      <FormControlLabel
                        value={
                          state.game.steps[state.game.currentStep].options[3]
                        }
                        label={
                          state.game.steps[state.game.currentStep].options[3]
                        }
                        control={<Radio />}
                      />
                    </RadioGroup>
                    <FormHelperText>{helperText}</FormHelperText>
                    <Button
                      sx={{ mt: 1, mr: 1 }}
                      type="submit"
                      variant="outlined"
                    >
                      Check Answer
                    </Button>
                  </FormControl>
                </QuizFormWrapper>
              )}
            </Box>
          </div>
        </main>
      </div>
    </Layout>
  );
}
