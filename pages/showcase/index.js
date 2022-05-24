import React, { useState, useEffect, useContext, useRef } from "react";
import Layout from "../../components/layout";
import styles from "./showcase.module.scss";
import Head from "next/head";
import styled from "styled-components";

const ParallaxContainer = styled.div`
  height: 800px;
  background-color: black;
`;

const GalleryWrapper = styled.div`
  border: 1px blue solid;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  /* display: flex;
  flex-direction: column;
  justify-content: center; */
`;

export default function Game(props) {
  const isAvailable = useRef(false);

  useEffect(() => {
    isAvailable.current =
      typeof window !== "undefined" && window.location.search;

    var container =
        window && window.document.getElementById("parallax-container"),
      waveSrc = [],
      waves = [],
      imgLoc = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/",
      j = 0;

    for (var i = 0; i < 10; i++) {
      waveSrc[i] = imgLoc + "wave" + (i + 1) + ".jpg";
    }

    function getRandomInRange(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function preloadImage(filename) {
      var img = new Image();
      img.onload = function () {
        img.xPlane = getRandomInRange(-500, screenWidth - 500);
        img.yPlane = getRandomInRange(500, 800);
        img.zPlane = getRandomInRange(300, 2000);
        img.style =
          "transform: translate3d(" +
          img.xPlane +
          "px, " +
          img.yPlane +
          "px, -" +
          img.zPlane +
          "px)";
        container.appendChild(img);
      };
      imgLoc = "";
      img.src = imgLoc + filename;
      img.alt = "";
      waves[j] = img;
      j++;
    }

    function loadImages() {
      for (var i = 0; i < waveSrc.length; ++i) {
        var filename = waveSrc[i];
        preloadImage(filename);
      }
    }

    function moveImages() {
      waves.forEach(function (image) {
        image.yPlane = image.yPlane - 2;
        image.style.cssText =
          "transform: translate3d(" +
          image.xPlane +
          "px, " +
          image.yPlane +
          "px,  -" +
          image.zPlane +
          "px); z-index: " +
          image.zIndex;
      });
      window.requestAnimationFrame(moveImages);
    }

    // var perspImages = container.getElementsByTagName("img"),
    //   screenWidth = window.screen.width,
    //   screenHeight = window.screen.height;

    // loadImages();
    // window.requestAnimationFrame(moveImages);
  }, []);

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
          <GalleryWrapper>
            <input
              type="radio"
              className={styles.radiofront}
              name="select-face"
            />
            {/* <input
              type="radio"
              className={styles.radioleft}
              name="select-face"
            /> */}
            {/* <input
              type="radio"
              className={styles.radioright}
              name="select-face"
            /> */}
            <input
              type="radio"
              className={styles.radiotop}
              name="select-face"
            />
            <input
              type="radio"
              className={styles.radiobottom}
              name="select-face"
            />
            <input
              type="radio"
              className={styles.radioback}
              name="select-face"
            />
            <div className={styles.separator}></div>

            <div className={styles.space3d}>
              <div className={styles._3dbox}>
                <div
                  className={`${styles._3dface} ${styles._3dfacefront}`}
                ></div>
                <div className={`${styles._3dface} ${styles._3dfacetop}`}></div>
                <div
                  className={`${styles._3dface} ${styles._3dfacebottom}`}
                ></div>
                <div
                  className={`${styles._3dface} ${styles._3dfaceleft}`}
                ></div>
                <div
                  className={`${styles._3dface} ${styles._3dfaceright}`}
                ></div>
                <div
                  className={`${styles._3dface} ${styles._3dfaceback}`}
                ></div>
              </div>
            </div>
          </GalleryWrapper>
        </main>
      </div>
    </Layout>
  );
}
