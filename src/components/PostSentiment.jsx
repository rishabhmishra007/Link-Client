import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";

const PostSentimentAnalysis = ({ userComment }) => {
  const [sentimentData, setSentimentData] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Replace with your Hugging Face token
  const HF_API_TOKEN = "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"; // You'll need to provide this
  
  const commentArr = useMemo(() => 
    userComment?.comments?.map((comment) => ({
      description: comment?.description,
      image: comment?.imgurl || comment?.image // Support both imageUrl and image properties
    })) || [],
    [userComment?.comments?.length] // Only recreate if comments length changes
  );

  const detectLanguage = async (text) => {
    try {
      // First detect the language
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/fasttext-language-identification",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      if (!response.ok) {
        console.error("Error detecting language:", response.status);
        return "en"; // Default to English if detection fails
      }

      const data = await response.json();
      console.log("Language detection result:", data);
      
      if (Array.isArray(data) && data.length > 0 && data[0].length > 0) {
        const detectedLang = data[0][0];
        return detectedLang.label; // Returns language code like 'en', 'es', etc.
      }
      
      return "en"; // Default to English
    } catch (error) {
      console.error("Error in language detection:", error);
      return "en";
    }
  };
  
  const translateToEnglish = async (text, sourceLanguage) => {
    // Only translate if not already English
    if (sourceLanguage === "en") return text;
  
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/v1/translation/translate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          sourceLanguage
        })
      });
  
      console.log(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (Array.isArray(data) && data[0]) {
        return data[0].translation_text || text;
      }
  
      // Fallback to original text if translation fails
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const analyzeSentimentWithHuggingFace = async (comment) => {
    try {
      if (!comment || comment.trim() === "") {
        return "neutral";
      }
      
      // Step 1: Detect language
      const language = await detectLanguage(comment);
      console.log(`Detected language for "${comment}": ${language}`);
      
      // Step 2: Translate if not English
      const englishText = await translateToEnglish(comment, language);
      console.log(`${language !== "en" ? "Translated text" : "Original text"}: "${englishText}"`);
      
      // Step 3: Text sentiment analysis using Hugging Face inference API
      const response = await fetch(
        "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: englishText }),
        }
      );

      if (!response.ok) {
        console.error("Error response from Hugging Face API:", response.status);
        return "neutral";
      }

      const data = await response.json();
      console.log(`Comment: "${englishText}" → HF response:`, data);

      // Handle the response from Hugging Face
      if (Array.isArray(data) && data.length > 0) {
        // Find the sentiment with highest score
        const sentiments = data[0];
        if (sentiments.length === 0) return "neutral";

        // Map Hugging Face labels to our sentiment categories
        const highestSentiment = sentiments.reduce((prev, current) => 
          prev.score > current.score ? prev : current
        );
        
        // Define confidence threshold for better neutral detection
        const CONFIDENCE_THRESHOLD = 0.65;
        
        // If confidence is too low, consider it neutral
        if (highestSentiment.score < CONFIDENCE_THRESHOLD) {
          console.log(`Low confidence score (${highestSentiment.score}), marking as neutral`);
          return "neutral";
        }

        // Map model-specific labels to our positive/negative/neutral format
        if (highestSentiment.label.toLowerCase().includes("positive") || 
            highestSentiment.label === "LABEL_1") {
          return "positive";
        } else if (highestSentiment.label.toLowerCase().includes("negative") || 
                  highestSentiment.label === "LABEL_0") {
          return "negative";
        } else {
          return "neutral";
        }
      }
      
      return "neutral"; // Default fallback
    } catch (error) {
      console.error("Error during sentiment analysis:", error);
      return "neutral";
    }
  };

  const analyzeImageSarcasm = async (imageUrl) => {
    // Validate image URL
    if (!imageUrl || imageUrl === "undefined" || typeof imageUrl !== "string" || imageUrl.trim() === "") {
      console.log("Invalid image URL detected:", imageUrl);
      return null;
    }

    // Make sure URL has proper format - must be a proper URL
    if (!imageUrl.startsWith("http")) {
      console.log("Image URL doesn't have proper http prefix:", imageUrl);
      return null;
    }

    try {
      console.log("Analyzing image URL:", imageUrl);
      
      // First try - use a general image classification model
      const response = await fetch(
        "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            inputs: imageUrl 
          }),
        }
      );

      if (!response.ok) {
        console.error("Error response from image classification API:", response.status);
        // Don't return yet - try the backup method
      } else {
        const data = await response.json();
        console.log("Image classification result:", data);

        // Process image classification results if available
        if (Array.isArray(data) && data.length > 0) {
          // Look for specific emotions or concepts that indicate sentiment
          const negativeIndicators = ["sarcastic", "ironic", "mocking", "cynical", "angry", "sad", "disgusted", "eye_roll"];
          const positiveIndicators = ["happy", "smiling", "joyful", "laughing", "pleased"];
          
          // Check each label returned by the model
          for (const prediction of data) {
            if (!prediction || !prediction.label) continue;
            
            const label = prediction.label.toLowerCase();
            
            // Check for negative indicators first
            if (negativeIndicators.some(indicator => label.includes(indicator))) {
              console.log(`Found negative indicator in image: ${label}`);
              return "negative";
            }
            
            // Check for positive indicators
            if (positiveIndicators.some(indicator => label.includes(indicator))) {
              console.log(`Found positive indicator in image: ${label}`);
              return "positive";
            }
          }
        }
      }
      
      // Second approach - use image captioning model which might describe the emotional content
      try {
        const captionResponse = await fetch(
          "https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${HF_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              inputs: imageUrl 
            }),
          }
        );
        
        if (captionResponse.ok) {
          const captionData = await captionResponse.json();
          console.log("Image caption result:", captionData);
          
          if (captionData && captionData.generated_text) {
            const caption = captionData.generated_text.toLowerCase();
            console.log("Generated caption:", caption);
            
            // Check caption for emotional content
            const negativeWords = ["angry", "sad", "upset", "crying", "tears", "sarcastic", "ironic"];
            const positiveWords = ["happy", "smiling", "joyful", "laughing", "cheerful"];
            
            if (negativeWords.some(word => caption.includes(word))) {
              console.log("Negative sentiment detected in image caption");
              return "negative";
            }
            
            if (positiveWords.some(word => caption.includes(word))) {
              console.log("Positive sentiment detected in image caption");
              return "positive";
            }
          }
        }
      } catch (captionError) {
        console.error("Error with image captioning:", captionError);
      }
      
      // Third try - use CLIP to compare against sentiment-related concepts
      try {
        const clipResponse = await fetch(
          "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch16",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${HF_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              inputs: {
                image: imageUrl,
                text: ["a happy image", "a sad image", "a sarcastic meme", "a neutral image"]
              }
            }),
          }
        );
        
        if (clipResponse.ok) {
          const clipData = await clipResponse.json();
          console.log("CLIP multimodal analysis:", clipData);
          
          // Find the highest scoring category - CLIP format can vary
          if (clipData) {
            let highestScore = 0;
            let highestLabel = "";
            
            // Handle different response formats
            if (Array.isArray(clipData) && clipData.length > 0) {
              // Format 1: [{"score": 0.1, "label": "text"}, ...]
              if (clipData[0].score !== undefined) {
                for (const item of clipData) {
                  if (item.score > highestScore) {
                    highestScore = item.score;
                    highestLabel = item.label;
                  }
                }
              } 
              // Format 2: [{scores: [], labels: []}]
              else if (clipData[0].scores !== undefined) {
                const highestIndex = clipData[0].scores.indexOf(Math.max(...clipData[0].scores));
                highestLabel = clipData[0].labels[highestIndex];
              }
            }
            
            console.log("Highest matching concept:", highestLabel);
            
            if (highestLabel.includes("sarcastic") || highestLabel.includes("sad")) {
              return "negative";
            } else if (highestLabel.includes("happy")) {
              return "positive";
            } else if (highestLabel.includes("neutral")) {
              return "neutral";
            }
          }
        }
      } catch (clipError) {
        console.error("Error with CLIP analysis:", clipError);
      }
      
      console.log("No conclusive sentiment detected in image");
      return null; // No conclusive sentiment detected
    } catch (error) {
      console.error("Error during image sentiment analysis:", error);
      return null;
    }
  };

  const analyzeMixedContent = async (comment) => {
    // If there's no valid comment object, return neutral
    if (!comment || (!comment.description && !comment.image)) {
      console.log("Empty comment or missing both text and image:", comment);
      return "neutral";
    }

    let textSentiment = "neutral";
    let imageSentiment = null;
    let hasText = false;
    let hasImage = false;

    // Analyze text if available
    if (comment.description && comment.description.trim().length > 0) {
      hasText = true;
      console.log("Analyzing text sentiment for:", comment.description);
      textSentiment = await analyzeSentimentWithHuggingFace(comment.description);
      console.log("Text sentiment result:", textSentiment);
    }

    // Analyze image if available - try both image and imageUrl properties
    const imageUrl = comment.image || comment.imgurl;
    if (imageUrl) {
      hasImage = true;
      console.log("Analyzing image sentiment for:", imageUrl);
      imageSentiment = await analyzeImageSarcasm(imageUrl);
      console.log("Image sentiment result:", imageSentiment);
    }
    
    // Possible combinations logic:
    
    // CASE 1: Both text and image with results for both
    if (hasText && hasImage && textSentiment && imageSentiment) {
      // If image shows negativity/sarcasm but text is positive, likely sarcastic
      if (imageSentiment === "negative" && textSentiment === "positive") {
        console.log("Detected sarcasm: negative image with positive text");
        return "negative";
      }
      
      // If both agree, that's our answer
      if (imageSentiment === textSentiment) {
        return textSentiment;
      }
      
      // In case of conflict (except the sarcasm case above), 
      // text usually carries more explicit sentiment
      return textSentiment;
    }
    
    // CASE 2: Only image with results
    if (hasImage && imageSentiment && (!hasText || textSentiment === "neutral")) {
      return imageSentiment;
    }
    
    // CASE 3: Only text with results
    if (hasText && textSentiment && (!hasImage || !imageSentiment)) {
      return textSentiment;
    }
    
    // CASE 4: No conclusive results from either source
    return "neutral";
  };

  const calculateSentimentData = async () => {
    const initialSentimentData = { positive: 0, negative: 0, neutral: 0 };

    try {
      if (commentArr.length === 0) {
        console.log("No comments to analyze");
        return initialSentimentData;
      }

      console.log(`Analyzing ${commentArr.length} comments in batches`);
      
      // Process in smaller batches to avoid rate limiting and improve UI responsiveness
      const batchSize = 2; // Reduced batch size for better error handling
      for (let i = 0; i < commentArr.length; i += batchSize) {
        const batch = commentArr.slice(i, i + batchSize);
        console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(commentArr.length/batchSize)}`);

        // Process each comment in the batch
        for (const comment of batch) {
          try {
            console.log("Analyzing comment:", comment);
            const sentiment = await analyzeMixedContent(comment);
            console.log("Final sentiment for comment:", sentiment);
            
            // Only count valid sentiments
            if (sentiment && ['positive', 'negative', 'neutral'].includes(sentiment)) {
              initialSentimentData[sentiment] += 1;
            } else {
              console.warn("Invalid sentiment result, defaulting to neutral:", sentiment);
              initialSentimentData.neutral += 1;
            }
          } catch (commentError) {
            console.error("Error processing individual comment:", commentError);
            // Count error cases as neutral
            initialSentimentData.neutral += 1;
          }
        }

        // Add a delay between batches to avoid rate limiting
        if (i + batchSize < commentArr.length) {
          console.log("Pausing between batches...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log("Final sentiment distribution:", initialSentimentData);
    } catch (error) {
      console.error("Error calculating sentiment data:", error);
    }

    return initialSentimentData;
  };

  useEffect(() => {
    // Reset data when new comments arrive
    if (commentArr.length > 0) {
      console.log("Starting sentiment analysis for", commentArr.length, "comments");
      setIsLoading(true);
      
      const updateSentimentData = async () => {
        const updatedSentimentData = await calculateSentimentData();
        setSentimentData(updatedSentimentData);
        setIsLoading(false);
      };

      updateSentimentData();
    } else {
      console.log("No comments to analyze");
      setSentimentData({
        positive: 0,
        negative: 0,
        neutral: 0,
      });
    }
  }, [userComment?.comments?.length]); // Only trigger when comment count changes

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
        Analyze sentiments based on comments and images using Hugging Face AI.
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

export default PostSentimentAnalysis;