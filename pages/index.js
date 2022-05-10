import React, { useState } from "react";
import { Button, Stack, Grid, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { FormControl } from "@mui/material";

import Head from "next/head";
import Layout from "../components/layout";
import TextField from "@mui/material/TextField";

export default function Home() {
  const [textInput, setTextInput] = useState("");

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
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
                      alert(textInput);
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
