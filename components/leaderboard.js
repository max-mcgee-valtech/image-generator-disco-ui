import React, { useEffect, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import StarIcon from "@mui/icons-material/Star";
import styled from "styled-components";
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  onValue,
  limitToLast,
} from "firebase/database";

const Title = styled.h2`
  font-size: "20px";
`;

const ListItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 10rem;
`;

const Container = styled.div`
  border: 1px solid black;
  width: 400px;
  display: flex;
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
    </Container>
  );
}
