import React from "react";
import Head from "next/head";

export const AppHead = () => {
  return (
    <Head>
      <title>Video Summariser</title>
      <meta
        name="description"
        content="Paste a youtube link and get a text summary - perfect for when you don't have 3 hours to listen to a podcast"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};
