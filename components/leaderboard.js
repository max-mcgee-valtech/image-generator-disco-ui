import React, { useEffect, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
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
  height: 13px;
  position: relative;
  top: -136px;
  @media screen and (max-width: 768px) {
    font-size: 14px;
    height: 2px;
    top: -64px;
  }
`;

const ListItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 8rem;
  position: relative;
  left: 12px;
  @media screen and (max-width: 768px) {
    width: 4.5rem;
    font-size: 14px;
  }
`;

const ListItemContainer = styled(ListItem)`
  padding-left: 42px;
  @media screen and (max-width: 768px) {
    min-width: 2px;
    padding: 0 16px;
  }
`;

const ListItemIconWrapper = styled(ListItemIcon)`
  @media screen and (max-width: 768px) {
    min-width: 2px;
  }
`;

const UserName = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
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
  border: 1px solid black;
  width: 300px;
  display: flex;
  perspective: 1000px;
  flex-direction: column;
  align-items: center;
  @media screen and (max-width: 768px) {
    width: 150px;
  }
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

          allScores.push(childData);
        },
        {
          onlyOnce: true,
        }
      );
      setLeaderBoard(allScores.reverse());
    });
  }, []);

  return (
    <Container>
      <Shape>
        <div
          className={`${styles._3dface} ${styles._3dfacefront}`}
          style={{
            background: "#0f9",
          }}
        >
          <Title>All-Time Leaderboard</Title>
          <List>
            {leaderboard.map((value, index) => {
              return (
                <ListItemContainer>
                  {index === 0 && (
                    <ListItemIconWrapper>
                      <StarIcon />
                    </ListItemIconWrapper>
                  )}
                  <ListItemText
                    primary={
                      <ListItemWrapper>
                        <UserName>{value.username}</UserName>
                        <div>{value.points}</div>
                      </ListItemWrapper>
                    }
                    inset
                    sx={{
                      paddingLeft: index === 0 ? 0 : "auto",
                      "@media (max-width: 768px)": {
                        fontSize: "14px",
                        paddingLeft: index === 0 ? 0 : "26px",
                      },
                    }}
                  />
                </ListItemContainer>
              );
            })}
          </List>
        </div>
        <div
          className={`${styles._3dface} ${styles._3dfacetop}`}
          style={{
            background: "#0f9",
          }}
        ></div>
        <div
          className={`${styles._3dface} ${styles._3dfacebottom}`}
          style={{
            background: "#0f9",
          }}
        ></div>
        <div
          className={`${styles._3dface} ${styles._3dfaceleft}`}
          style={{
            background: "#0f9",
          }}
        ></div>
        <div
          className={`${styles._3dface} ${styles._3dfaceright}`}
          style={{
            background: "#0f9",
          }}
        ></div>
        <div
          className={`${styles._3dface} ${styles._3dfaceback}`}
          style={{
            background: "#0f9",
          }}
        ></div>
      </Shape>
    </Container>
  );
}
