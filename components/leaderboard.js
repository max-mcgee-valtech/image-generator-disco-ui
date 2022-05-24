import React, { useEffect, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import StarIcon from "@mui/icons-material/Star";
import styled from "styled-components";
import styles from "./leaderboard.module.scss";
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  onValue,
  limitToLast,
} from "firebase/database";

const Title = styled.h2`
  font-size: 20px;
  height: 40px;
  position: relative;
  top: -156px;
`;

const ListItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 10rem;
  position: relative;
  left: 60px;
`;

const Shape = styled.div`
  display: inline-block;
  transition: all 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-align: center;
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: rotateX(-10deg) rotateY(15deg);
`;

const Container = styled.div`
  background: orange;
  border: 1px solid black;
  width: 400px;
  display: flex;
  perspective: 1000px;
  flex-direction: column;
  align-items: center;
`;

export default function InsetList() {
  const [leaderboard, setLeaderBoard] = useState([]);
  const database = getDatabase();
  const topUserPostsRef = query(
    ref(database, "scores"),
    orderByChild("points"),
    limitToLast(5)
  );

  useEffect(() => {
    //To add a listener you can use the onValue() method like,
    onValue(query(topUserPostsRef), (snapshot) => {
      let allScores = [];
      snapshot.forEach(
        (childSnapshot) => {
          const childKey = childSnapshot.key;
          const childData = childSnapshot.val();
          console.log("childData", childData);
          allScores.push(childData);
        },
        {
          onlyOnce: true,
        }
      );
      setLeaderBoard(allScores.reverse());
    });
  }, []);

  console.log("all scores", leaderboard);

  return (
    <Container>
      <Shape>
        <div
          className={`${styles._3dface} ${styles._3dfacefront}`}
          style={{
            background: "lightblue",
          }}
        >
          <Title>All-Time Leaderboard</Title>
          <List>
            {leaderboard.map((value, index) => {
              return (
                <ListItem>
                  {index === 0 && (
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={
                      <ListItemWrapper>
                        <div>{value.username}</div>
                        <div>{value.points}</div>
                      </ListItemWrapper>
                    }
                    inset
                    sx={{ paddingLeft: index === 0 ? 0 : "auto" }}
                  />
                </ListItem>
              );
            })}
          </List>
        </div>
        <div
          className={`${styles._3dface} ${styles._3dfacetop}`}
          style={{
            background: "lightblue",
          }}
        ></div>
        <div
          className={`${styles._3dface} ${styles._3dfacebottom}`}
          style={{
            background: "lightblue",
          }}
        ></div>
        <div
          className={`${styles._3dface} ${styles._3dfaceleft}`}
          style={{
            background: "lightblue",
          }}
        ></div>
        <div
          className={`${styles._3dface} ${styles._3dfaceright}`}
          style={{
            background: "lightblue",
          }}
        ></div>
        <div
          className={`${styles._3dface} ${styles._3dfaceback}`}
          style={{
            background: "lightblue",
          }}
        ></div>
      </Shape>
    </Container>
  );
}
