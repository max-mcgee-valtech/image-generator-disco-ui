import React, { useState } from "react";
import { Button, Stack, Grid, Box } from "@mui/material";

import Head from "next/head";
import Layout from "../components/layout";
import TextField from "@mui/material/TextField";

export default function Home() {
  const [textInput, setTextInput] = useState("");

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  };

  const handleSubmit = () => {
    console.log(textInput);
    (async () => {
      const rawResponse = await fetch("http://54.193.32.57:5000/handle_data", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textPrompt: textInput,
        }),
      });
      const content = await rawResponse.json();

      console.log(content);
    })();
  };

  return (
    <Layout>
      <div className="container">
        <Head>
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
                <Grid item>
                  <div>
                    Data:
                    <br />
                    {textInput}
                  </div>
                </Grid>
              </Grid>
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
