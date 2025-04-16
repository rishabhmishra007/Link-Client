import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SentimentAnalysis = ({ userComment }) => {
  const [sentimentData, setSentimentData] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);

  const commentArr = useMemo(() => 
    userComment?.comments?.map((comment) => comment?.description) || [],
    [userComment?.comments?.length] // Only recreate if comments length changes
  );

  const analyzeSentiment = async (comment) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite"});
      const prompt = `
        Task: Analyze the sentiment of the following social media comment after translating them into english language if they are in some other languages.  Classify the sentiment as one of these options: Positive, Negative, or Neutral.  Consider the context of the comment and the typical emotions expressed in social media posts.

        Example 1:
        Comment: "This is amazing! I love it!"
        Sentiment: Positive

        Example 2:
        Comment: "This is terrible. I'm so disappointed."
        Sentiment: Negative

        Example 3:
        Comment: "Okay, I guess."
        Sentiment: Neutral

        Comment: "${comment}"

        Sentiment (Positive, Negative, or Neutral):
        `;

      const result = await model.generateContent(prompt);

      if (!result || !result.response) {
        console.error("Invalid response from Gemini AI:", result);
        return comment;
      }

      const text = result.response.text();
      const lowerText = text.toLowerCase();
      console.log(`Comment: "${comment}" → Gemini response: "${text}"`);

      if (lowerText.includes("positive")) {
        return "positive";
      } else if (lowerText.includes("negative")) {
        return "negative";
      } else if (lowerText.includes("neutral")) {
        return "neutral";
      } else {
        console.warn("Unexpected response from Gemini AI:", text);
        return "neutral";
      }
    } catch (error) {
      console.error("Error during sentiment analysis:", error);
      return "neutral";
    }
  };

  const calculateSentimentData = async () => {
    const initialSentimentData = { positive: 0, negative: 0, neutral: 0 };
    setIsLoading(true);

    try {
      if (commentArr.length === 0) {
        setIsLoading(false);
        return initialSentimentData;
      }

      const batchSize = 3;
      for (let i = 0; i < commentArr.length; i += batchSize) {
        const batch = commentArr
          .slice(i, i + batchSize)
          .filter((comment) => comment && comment.trim().length > 0);

        const sentimentPromises = batch.map((comment) =>
          analyzeSentiment(comment)
        );
        const sentiments = await Promise.all(sentimentPromises);

        sentiments.forEach((sentiment) => {
          if (sentiment) {
            initialSentimentData[sentiment] += 1;
          }
        });

        if (i + batchSize < commentArr.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      console.log("Final sentiment distribution:", initialSentimentData);
    } catch (error) {
      console.error("Error calculating sentiment data:", error);
    }

    setIsLoading(false);
    return initialSentimentData;
  };

  useEffect(() => {
    if (commentArr.length > 0) {
      const updateSentimentData = async () => {
        const updatedSentimentData = await calculateSentimentData();
        setSentimentData(updatedSentimentData);
      };

      updateSentimentData();
    }
  }, [userComment]);

  const totalComments = Object.values(sentimentData).reduce((a, b) => a + b, 0);
  const positivePercentage =
    totalComments > 0
      ? ((sentimentData.positive / totalComments) * 100).toFixed(1)
      : 0;
  const negativePercentage =
    totalComments > 0
      ? ((sentimentData.negative / totalComments) * 100).toFixed(1)
      : 0;
  const neutralPercentage =
    totalComments > 0
      ? ((sentimentData.neutral / totalComments) * 100).toFixed(1)
      : 0;

  const chartData = {
    labels: [
      `Positive (${positivePercentage}%)`,
      `Negative (${negativePercentage}%)`,
      `Neutral (${neutralPercentage}%)`,
    ],
    datasets: [
      {
        data: [
          sentimentData.positive,
          sentimentData.negative,
          sentimentData.neutral,
        ],
        backgroundColor: ["#4caf50", "#f44336", "#ffeb3b"],
        hoverBackgroundColor: ["#66bb6a", "#e57373", "#fff176"],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 14,
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Box
      sx={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Post Analysis
      </Typography>
      <Typography variant="body1" gutterBottom>
        Analyze sentiments based on comments using ~Link AI.
      </Typography>

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Analyzing sentiments...
          </Typography>
        </Box>
      ) : commentArr.length === 0 ? (
        <Typography variant="body1" sx={{ my: 4 }}>
          No comments to analyze. Please add comments to see sentiment analysis.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "column" },
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          {/* Chart Section */}
          <Box
            sx={{
              height: "300px",
              width: { xs: "100%", md: "100%" },
              mb: { xs: 4, md: 0 },
            }}
          >
            <Doughnut data={chartData} options={chartOptions} />
          </Box>

          {/* Sentiment Breakdown */}
          <Box sx={{ width: { xs: "100%", md: "35%" }, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              Sentiment Breakdown
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Box
                sx={{ width: 16, height: 16, bgcolor: "#4caf50", mr: 1 }}
              ></Box>
              <Typography variant="body1">
                Positive: {sentimentData.positive} ({positivePercentage}%)
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Box
                sx={{ width: 16, height: 16, bgcolor: "#f44336", mr: 1 }}
              ></Box>
              <Typography variant="body1">
                Negative: {sentimentData.negative} ({negativePercentage}%)
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{ width: 16, height: 16, bgcolor: "#ffeb3b", mr: 1 }}
              ></Box>
              <Typography variant="body1">
                Neutral: {sentimentData.neutral} ({neutralPercentage}%)
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
              Total Comments Analyzed: {totalComments}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SentimentAnalysis;
