// https://codepen.io/chinchang/pen/nNgLgP
import React, { useState, useContext, useEffect, useRef } from "react";
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
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  FormControlLabel,
} from "@mui/material";
import styled from "styled-components";
import Head from "next/head";
import Image from "next/image";

import styles from "./game.module.scss";
import Layout from "../../components/layout";
import Leaderboard from "../../components/leaderboard";
import { ApiContext } from "../../utils/gameProvider";
import {
  StyledButton,
  ImageWrapper,
} from "../../components/sharedStyledComponents";

const QuizFormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 9rem;
  max-width: 650px;
  min-height: 400px;
  width: 650px;
  justify-content: flex-start;
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
  background-size: 8px 8px;
  background-image: linear-gradient(90deg, #f5f5f5 6px, transparent 1%),
    linear-gradient(#f5f5f5 6px, transparent 1%);
  background-color: #e0dad3;

  @media only screen and (min-width: 1024px) and (max-width: 1380px) {
    padding-left: 20rem;
  }

  @media screen and (max-width: 1023px) {
    padding-top: 11rem;
    padding-right: 1.5rem;
    padding-left: 1.5rem;
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
`;

const GameOverWrapper = styled.div`
  padding: 4rem;
  @media screen and (max-width: 768px) {
    padding: 4rem 0;
  }
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
  @media screen and (max-width: 768px) {
    padding: 0.5rem 0 2rem;
  }
`;

export const CountdownContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  padding-top: 1rem;
  ${(props) => {
    props.showWarningColor ? "red" : "black";
  }}
`;

export const GameScore = styled.div`
  display: flex;
  justify-content: space-between;
  width: 600px;

  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;

const AboutSection = styled.div`
  width: 500px;
  line-height: 26px;
  padding-top: 3rem;
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
  const [textFieldError, setTextFieldError] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [captionValue, setCaptionValue] = useState("");
  const [message, setMessage] = useState("default");
  const [helperText, setHelperText] = useState("Choose wisely");
  const [timer, setTimer] = useState("00:20");
  const [startTime, setStartTime] = useState(20);
  const counterRef = useRef(0);

  const database = getDatabase();

  useEffect(() => {
    counterRef.current = state.game.currentStep;
  });

  // BEGIN TIMER https://www.geeksforgeeks.org/how-to-create-a-countdown-timer-using-reactjs/
  const Ref = useRef(null);
  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    return {
      total,
      hours,
      minutes,
      seconds,
    };
  };

  const startTimer = (e) => {
    let { total, minutes, seconds } = getTimeRemaining(e);
    if (total === 0) {
      triggerWrongAnswer();
    }
    if (total >= 0) {
      setTimer(
        (minutes > 9 ? minutes : "0" + minutes) +
          ":" +
          (seconds > 9 ? seconds : "0" + seconds)
      );
    }
  };

  const clearTimer = (e, time, stopQuiz = false) => {
    let formatTime;
    if (time < 10) {
      formatTime = `0${time}`;
    } else {
      formatTime = time;
    }
    setTimer(`00:${formatTime}`);
    if (Ref.current) clearInterval(Ref.current);
    if (stopQuiz) {
      return;
    }
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  const getDeadTime = (time = 0) => {
    let deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + time);

    return deadline;
  };

  const onClickReset = (time) => {
    const isFinalStep = counterRef.current > 6;
    console.log("counterRef", counterRef.current);
    clearTimer(getDeadTime(time), time, isFinalStep ?? false);
  };
  // END TIMER https://www.geeksforgeeks.org/how-to-create-a-countdown-timer-using-reactjs/

  const onPlayAgain = () => {
    dispatch({
      type: "RESET_GAME",
    });
    setStartTime(20);
    setupGame();
  };

  const handleRadioChange = (event) => {
    setCaptionValue(event.target.value);
    setHelperText("");
  };

  const incrementPoint = () => {
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
  };

  const triggerWrongAnswer = () => {
    setMessage("incorrect");
    setHelperText("Sorry, wrong answer!");
    // When Answer is wrong, leave at current countdown
    setStartTime(startTime);
    triggerNextStep(startTime);
  };

  const handleSubmitQuestion = (event) => {
    event.preventDefault();
    let newStart = startTime;
    if (
      captionValue ==
      state.game.steps[state.game.currentStep]?.correctTextPrompt
    ) {
      setHelperText("You got it!");
      setMessage("correct");
      incrementPoint();
      // When Answer is right, subtract 2 from countdown
      newStart = startTime - 2;
      setStartTime(newStart);
      triggerNextStep(newStart);
    } else {
      triggerWrongAnswer();
    }
  };

  const triggerNextStep = (newStart) => {
    setTimeout(() => {
      setCaptionValue("");
      setHelperText("Choose wisely");
      console.log("sett current step");
      dispatch({
        type: "INCREMENT_CURRENT_STEP",
      });
      onClickReset(newStart);
      setMessage("default");
    }, 1500);
  };

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  };

  const setupGame = async () => {
    if (textInput === "") {
      return setTextFieldError("You must enter a name");
    }
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

    clearTimer(getDeadTime(20), 20);
  };

  const multipleChoiceOptions =
    state.game.steps[state.game.currentStep]?.options;

  const multChoiceStyle = (index) => {
    return {
      padding: "5px 0",
      color:
        message == "correct" &&
        state.game.steps[state.game.currentStep].options[index] === captionValue
          ? "#3B9C75"
          : message == "incorrect" &&
            state.game.steps[state.game.currentStep].options[index] ===
              captionValue
          ? "red"
          : "#000",
    };
  };

  return (
    <Layout>
      <Head>
        <title>Pixel Machine</title>
        <meta
          http-equiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ViewContainer>
        <Leaderboard />
        <GameContainer>
          <ImageWrapper>
            <Image src="/FS_Logo_Black.png" layout="fill" objectFit="contain" />
          </ImageWrapper>

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
                  className="playerNameInput"
                  label={"Full Name"}
                  placeholder={"Full Name"}
                  value={textInput}
                  multiline
                  helperText={textFieldError}
                  onChange={handleTextInputChange}
                  sx={{
                    color: "black",
                    borderColor: "black",
                    width: "300px",
                    height: "82px",
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
              <AboutSection>
                The Pixel Machine game tests your ability to match AI generated
                images with their caption. As you progress through the game,
                beware - the time to guess the correct caption decreases. Fight
                to reach the top of the leaderboard as you see the work of our
                community of AI artists!
                <br />
                <br />
                To create an image, check out the{" "}
                <a href="/" style={{ color: "black" }}>
                  image generation playground
                </a>
                .{" "}
              </AboutSection>
            </div>
          )}
          {state.game.steps[state.game.currentStep] &&
            state.game.currentStep < 8 && (
              <QuizFormWrapper onSubmit={handleSubmitQuestion}>
                <CountdownContainer>Time Remaining {timer}</CountdownContainer>
                <FormControl
                  sx={{ m: 3, margin: "2rem 0" }}
                  variant="standard"
                  className="multipleChoiceContainer"
                >
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
                    value={captionValue}
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

                  <StyledButton
                    sx={{ mt: 1, mr: 1 }}
                    type="submit"
                    variant="outlined"
                  >
                    Check Answer
                  </StyledButton>
                </FormControl>
              </QuizFormWrapper>
            )}
          {state.game.currentStep === 8 && (
            <GameOverWrapper>
              <Title>{`Game Over, ${currentPlayer.username}`}</Title>
              <Title>{`Your All-Time Score: ${currentPlayer.points} `}</Title>
              <StyledButton onClick={onPlayAgain}>Play Again</StyledButton>
            </GameOverWrapper>
          )}
        </GameContainer>
      </ViewContainer>
    </Layout>
  );
}
