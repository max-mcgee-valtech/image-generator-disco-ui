import React from "react";
import cloudinary from "cloudinary";
import { Box, Skeleton } from "@mui/material";
import styled from "styled-components";
import { SkeletonContainerDesktop, SkeletonContainerMobile, Caption } from "..";

import Head from "next/head";
import Layout from "../../components/layout";

const MainImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  @media screen and (max-width: 600px) {
    padding: 1rem 0;
  }
`;

const MainImage = styled.img`
  width: 100%;
  max-width: 600px;
  max-height: 392px;
  height: auto;
  border-radius: 6px;
  padding-bottom: 2rem;
`;

export async function getServerSideProps(context) {
  cloudinary.config({
    cloud_name: "detzng4ks",
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  const images = await cloudinary.v2.search
    .expression("folder=disco-diffusion-active-tests")
    .expression(context.params.id)
    .sort_by("public_id", "desc")
    .with_field("context")
    .execute()
    .then((result) => {
      return {
        image: result.resources,
      };
    });

  return {
    props: { images },
  };
}

export default function Home(props) {
  const image = props.images.image[0];

  return (
    <Layout>
      <div className="container">
        <Head>
          <meta content="upgrade-insecure-requests" />
          <title>View Image</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <div>
            <Box sx={{ width: "100%" }}>
              <MainImageContainer>
                {image.context.alt === "pending" ? (
                  <>
                    <SkeletonContainerDesktop>
                      <Skeleton
                        variant="rectangular"
                        width={600}
                        height={392}
                      />
                    </SkeletonContainerDesktop>
                    <SkeletonContainerMobile>
                      <Skeleton
                        variant="rectangular"
                        width={320}
                        height={200}
                      />
                    </SkeletonContainerMobile>
                  </>
                ) : (
                  <MainImage
                    src={`${image.url}?w=164&h=164&fit=crop&auto=format`}
                  />
                )}

                <Caption>{image.context.caption}</Caption>
              </MainImageContainer>
            </Box>
          </div>
        </main>
      </div>
    </Layout>
  );
}
