import React, { useState, useEffect, useContext } from "react";

import {
  getDatabase,
  ref,
  query,
  orderByChild,
  onValue,
  limitToLast,
  update,
  push,
  child,
} from "firebase/database";

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
import Link from "next/link";

import Layout from "../../components/layout";
import Leaderboard from "../../components/leaderboard";
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

export const Title = styled.div``;

export const ScoreContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`;

export const GameScore = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 2rem 0;
  width: 100%;
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
  const [textInput, setTextInput] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const database = getDatabase();

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

  function incrementPoint() {
    console.log("CURRENT PLAYer", currentPlayer);
    const db = getDatabase();
    // A post entry.

    const newPostKey = currentPlayer?.key ?? push(child(ref(db), "scores")).key;

    const postData = {
      username: currentPlayer?.username ?? textInput,
      points: currentPlayer?.points ? currentPlayer.points + 1 : 1,
    };

    // Write the new post's data simultaneously in the posts list and the user's post list.
    let updates = {};

    updates["/scores/" + newPostKey] = postData;
    dispatch({
      type: "INCREMENT_CURRENT_GAME_POINTS",
    });
    return update(ref(db), updates);
  }

  const handleSubmitQuestion = (event) => {
    event.preventDefault();

    if (value == state.game.steps[state.game.currentStep].correctTextPrompt) {
      setHelperText("You got it!");
      incrementPoint();
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

  const handleSubmit = async () => {
    const topUserPostsRef = query(ref(database, "scores"));

    //To add a listener you can use the onValue() method like,
    onValue(query(topUserPostsRef), (snapshot) => {
      snapshot.forEach(
        (childSnapshot) => {
          const childKey = childSnapshot.key;
          const childData = childSnapshot.val();
          if (childData.username == textInput) {
            console.log("MATCHES PLAYER", childData);
            setCurrentPlayer({ ...childData, key: childKey });
          }
        },
        {
          onlyOnce: true,
        }
      );
    });

    const numQuestions = 10;
    dispatch({
      type: "UPDATE_NUM_QUESTIONS",
      payload: numQuestions,
    });

    const randomizedImages = props.images.images
      .filter((img) => img.context?.caption)
      .sort(() => 0.5 - Math.random());
    let imagesForQuiz = randomizedImages.slice(0, numQuestions);

    const cleanedImages = imagesForQuiz.map((quizImage) => {
      const randomCaptions = randomizedImages
        .filter(
          (randImg) =>
            randImg.context?.caption &&
            quizImage.context?.caption !== randImg.context?.caption
        )
        .map((i) => i.context.caption)
        .sort(() => 0.5 - Math.random());

      if (quizImage.context?.caption) {
        return {
          filename: quizImage.filename,
          currentStep: 1,
          url: quizImage.url,
          correctTextPrompt: quizImage.context?.caption ?? "",
          options: randomCaptions
            .slice(0, 3)
            .concat(quizImage.context?.caption ?? "")
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
              <Leaderboard />

              {state.game.currentStep > 0 && (
                <GameScore>
                  <ScoreContainer>
                    Question {state.game.currentStep}
                  </ScoreContainer>
                  <ScoreContainer>
                    Game Score: {state.game.currentGameScore} / 10
                  </ScoreContainer>
                </GameScore>
              )}
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
                      label={"Enter your Full Name"}
                      placeholder={"Enter your Full Name"}
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
              {state.game.currentStep > 10 && (
                <>
                  <Title>{`Game Over, ${currentPlayer.username}`}</Title>
                  <Title>{`Your Score: ${currentPlayer.points}`}</Title>
                </>
              )}
            </Box>
          </div>
        </main>
      </div>
    </Layout>
  );
}
