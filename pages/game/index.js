import React, { useState, useContext } from "react";
// https://codepen.io/mxmcg/pen/MWQEzoV

import {
  getDatabase,
  ref,
  query,
  onValue,
  update,
  push,
  child,
} from "firebase/database";

import cloudinary from "cloudinary";
import {
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

import styles from "./game.module.scss";
import Layout from "../../components/layout";
import Leaderboard from "../../components/leaderboard";
import { ApiContext } from "../../utils/gameProvider";

const QuizFormWrapper = styled.form`
  display: flex;
  justify-content: center;
  padding-top: 9rem;
  width: 650px;
  @media screen and (max-width: 768px) {
    width: 100%;
    padding-top: 5rem;
  }
`;

const GalleryWrapper = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GameContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  @media screen and (max-width: 768px) {
    margin-top: 11rem;
    padding: 0 1.5rem;
  }
`;

const CheckAnswerButton = styled(Button)`
  padding: 0.6rem 3rem;
  margin-bottom: 0.625rem;
  font-weight: 500;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  border: 5px solid #06477b;
  -webkit-box-shadow: 3px 4px #0f9;
  box-shadow: 3px 4px #0f9;
  color: #fff;
  background-color: #000;
  white-space: nowrap;
  cursor: pointer;
  overflow: hidden;
  vertical-align: middle;
  text-transform: uppercase;
  position: relative;
  outline: 0;
  letter-spacing: 0.0625rem;
  width: -webkit-fit-content;
  width: -moz-fit-content;
  width: fit-content;

  &:hover {
    border: 5px solid #000;
    background-color: #0f9;
    color: #000;
  }
`;

const Greeting = styled.div`
  display: flex;
  flex-direction: row;
  padding: 2rem 0;
  justify-content: center;
`;

const ViewContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  margin: 0;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  min-width: 20rem;
  overflow-anchor: none;
  -webkit-overflow-scrolling: touch;
  background-size: 8px 8px;
  background-image: linear-gradient(90deg, #f5f5f5 6px, transparent 1%),
    linear-gradient(#f5f5f5 6px, transparent 1%);
  background-color: #e0dad3;
`;

const GameOverWrapper = styled.div`
  padding: 4rem;
`;

export const Title = styled.div`
  font-size: 22px;
  padding-bottom: 1rem;
  &:nth-child(2) {
    padding-bottom: 2rem;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: center;
  justify-content: center;
  @media screen and (max-width: 768px) {
    margin-right: 4rem;
    margin-top: 0rem;
  }
`;

export const ScoreContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`;

export const GameScore = styled.div`
  display: flex;
  justify-content: space-between;
  width: 600px;

  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;

const BoxWrapper = styled.div`
  transform: ${(props) => {
    switch (props.step) {
      case 0:
        return "";
      case 1:
        return "rotateX(90deg)";
      case 2:
        return "rotateY(180deg)";
      case 3:
        return "rotateX(-90deg)";
      case 4:
        return "";
      case 5:
        return "rotateX(90deg)";
      case 6:
        return "rotateY(180deg)";
      case 7:
        return "rotateX(-90deg)";

      default:
        return "";
    }
  }};
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

  // useEffect(() => {
  //   console.log(state);
  // }, [state]);

  const onPlayAgain = () => {
    dispatch({
      type: "RESET_GAME",
    });
    setupGame();
  };

  const [value, setValue] = React.useState("");
  const [message, setMessage] = React.useState("default");
  const [helperText, setHelperText] = React.useState("Choose wisely");

  const handleRadioChange = (event) => {
    setValue(event.target.value);
    setHelperText(" ");
  };

  function incrementPoint() {
    const db = getDatabase();
    const newPostKey = currentPlayer?.key ?? push(child(ref(db), "scores")).key;

    const postData = {
      username: currentPlayer?.username ?? textInput,
      points: currentPlayer?.points ? currentPlayer.points + 1 : 1,
    };

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
      setMessage("correct");
      incrementPoint();
    } else {
      setMessage("incorrect");
      setHelperText("Sorry, wrong answer!");
    }

    setTimeout(() => {
      setValue("");
      setHelperText("Choose wisely");
      setMessage("default");
      dispatch({
        type: "INCREMENT_CURRENT_STEP",
      });
    }, 1500);
  };

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  };

  const setupGame = async () => {
    const topUserScoresRef = query(ref(database, "scores"));
    let playerMatched = false;
    onValue(query(topUserScoresRef), (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const childKey = childSnapshot.key;
        const childData = childSnapshot.val();
        if (childData.username == textInput) {
          setCurrentPlayer({ ...childData, key: childKey });
          playerMatched = true;
        }
      });

      if (!playerMatched) {
        setCurrentPlayer({ username: textInput, points: 0 });
      }
    });

    const numQuestions = 8;
    dispatch({
      type: "UPDATE_NUM_QUESTIONS",
      payload: numQuestions,
    });

    const randomizedImages = props.images.images
      .filter((img) => img.context?.caption && img.context?.alt !== "pending")
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
  };

  const multipleChoiceOptions =
    state.game.steps[state.game.currentStep]?.options;

  const multChoiceStyle = (index) => {
    return {
      color:
        message == "correct" &&
        state.game.steps[state.game.currentStep].options[index] === value
          ? "#3B9C75"
          : message == "incorrect" &&
            state.game.steps[state.game.currentStep].options[index] === value
          ? "red"
          : "#000",
    };
  };

  return (
    <Layout>
      <Head>
        <meta
          http-equiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
        <title>Image Alchemist</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ViewContainer>
        <Leaderboard />
        <GameContainer>
          {state.game.steps[state.game.currentStep] &&
            state.game.currentStep < 8 && (
              <GameScore>
                <ScoreContainer>
                  Question {state.game.currentStep + 1}
                </ScoreContainer>
                <ScoreContainer>
                  Game Score: {state.game.currentGameScore} / 8
                </ScoreContainer>
              </GameScore>
            )}
          {state.game.steps[state.game.currentStep] &&
            state.game.currentStep < 8 && (
              <GalleryWrapper>
                <div className={styles.space3d}>
                  <BoxWrapper
                    className={styles._3dbox}
                    step={state.game.currentStep}
                  >
                    <div
                      className={`${styles._3dface} ${styles._3dfacefront}`}
                      style={{
                        background: `url(${
                          state.game.steps[state.game.currentStep <= 3 ? 0 : 4]
                            .url
                        })`,
                      }}
                    ></div>
                    <div
                      className={`${styles._3dface} ${styles._3dfacetop}`}
                      style={{
                        background: `url(${
                          state.game.steps[state.game.currentStep <= 3 ? 3 : 7]
                            .url
                        })`,
                      }}
                    ></div>
                    <div
                      className={`${styles._3dface} ${styles._3dfacebottom}`}
                      style={{
                        background: `url(${
                          state.game.steps[state.game.currentStep <= 3 ? 1 : 5]
                            .url
                        })`,
                      }}
                    ></div>
                    <div
                      className={`${styles._3dface} ${styles._3dfaceback}`}
                      style={{
                        background: `url(${
                          state.game.steps[state.game.currentStep <= 3 ? 2 : 6]
                            .url
                        })`,
                      }}
                    ></div>
                    <div
                      className={`${styles._3dface} ${styles._3dfaceleft}`}
                      style={{
                        background:
                          "url(https://res.cloudinary.com/detzng4ks/image/upload/v1652919878/disco-diffusion-active-tests/8da05abb-d4b2-4579-82c0-d9d0af122f61.png)",
                      }}
                    ></div>
                    <div
                      className={`${styles._3dface} ${styles._3dfaceright}`}
                      style={{
                        background:
                          "url(https://res.cloudinary.com/detzng4ks/image/upload/v1652919878/disco-diffusion-active-tests/8da05abb-d4b2-4579-82c0-d9d0af122f61.png)",
                      }}
                    ></div>
                  </BoxWrapper>
                </div>
              </GalleryWrapper>
            )}
          {currentPlayer == null && (
            <div>
              <Greeting>Welcome, please enter your name</Greeting>
              <InputWrapper>
                <TextField
                  id={"outlined-textarea"}
                  label={"Full Name"}
                  placeholder={"Full Name"}
                  value={textInput}
                  multiline
                  onChange={handleTextInputChange}
                  sx={{
                    color: "black",
                    backgroundColor: "white",
                    borderColor: "black",
                    width: "300px",
                    ":hover": {
                      color: "black",
                    },
                    "@media (max-width: 768px)": {
                      width: "240px",
                    },
                  }}
                />

                <div
                  className={styles.playButton}
                  type={"submit"}
                  variant={"contained"}
                  color={"primary"}
                  onClick={setupGame}
                  sx={{
                    backgroundColor: "black",
                    ":hover": {
                      backgroundColor: "black",
                    },
                  }}
                >
                  Play
                </div>
              </InputWrapper>
            </div>
          )}
          {state.game.steps[state.game.currentStep] &&
            state.game.currentStep < 8 && (
              <QuizFormWrapper onSubmit={handleSubmitQuestion}>
                <FormControl sx={{ m: 3, margin: "2rem 0" }} variant="standard">
                  <FormLabel
                    id="demo-error-radios"
                    sx={{
                      paddingBottom: "0.5rem",
                      fontFamily: "FuturaStd-Heavy",
                      color: "black",
                      fontSize: "18px",
                    }}
                  >
                    Select your best guess at the prompt used to create the
                    image:
                  </FormLabel>
                  <FormHelperText
                    sx={{
                      paddingBottom: "0.5rem",
                      fontSize: "14px",
                      color:
                        message == "correct"
                          ? "#3B9C75"
                          : message == "incorrect"
                          ? "red"
                          : "black",
                      fontWeight: message == "default" ? "normal" : "bold",
                    }}
                  >
                    {helperText}
                  </FormHelperText>
                  <RadioGroup
                    aria-labelledby="demo-error-radios"
                    name="quiz"
                    value={value}
                    onChange={handleRadioChange}
                    sx={{
                      paddingBottom: "1rem",
                    }}
                  >
                    <FormControlLabel
                      value={multipleChoiceOptions[0]}
                      label={multipleChoiceOptions[0]}
                      control={<Radio />}
                      sx={multChoiceStyle(0)}
                    />
                    <FormControlLabel
                      value={multipleChoiceOptions[1]}
                      label={multipleChoiceOptions[1]}
                      control={<Radio />}
                      sx={multChoiceStyle(1)}
                    />
                    <FormControlLabel
                      value={multipleChoiceOptions[2]}
                      label={multipleChoiceOptions[2]}
                      control={<Radio />}
                      sx={multChoiceStyle(2)}
                    />
                    <FormControlLabel
                      value={multipleChoiceOptions[3]}
                      label={multipleChoiceOptions[3]}
                      control={<Radio />}
                      sx={multChoiceStyle(3)}
                    />
                  </RadioGroup>

                  <CheckAnswerButton
                    sx={{ mt: 1, mr: 1 }}
                    type="submit"
                    variant="outlined"
                  >
                    Check Answer
                  </CheckAnswerButton>
                </FormControl>
              </QuizFormWrapper>
            )}
          {state.game.currentStep === 8 && (
            <GameOverWrapper>
              <Title>{`Game Over, ${currentPlayer.username}`}</Title>
              <Title>{`Your All-Time Score: ${currentPlayer.points} `}</Title>
              <CheckAnswerButton onClick={onPlayAgain}>
                Play Again
              </CheckAnswerButton>
            </GameOverWrapper>
          )}
        </GameContainer>
      </ViewContainer>
    </Layout>
  );
}
