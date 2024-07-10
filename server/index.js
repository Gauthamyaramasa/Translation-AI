require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const bhashiniAxios = axios.create({
  baseURL: process.env.ULCA_BASE_URL,
  headers: {
    'userID': process.env.USER_ID,
    'ulcaApiKey': process.env.API_KEY,
  }
});

app.get('/translate', (req, res) => {
  res.send('Server is running');
});

app.post('/translate', async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;

  console.log('TEXT:', text);
  console.log('Received source language:', sourceLang);
  console.log('Received target language:', targetLang);

  // Check if the source and target languages are the same
  if (sourceLang === targetLang) {
    console.log('Source and target languages are the same. No translation needed.');
    return res.json({ translatedText: text });
  }

  const configPayload = {
    "pipelineTasks": [
      {
        "taskType": "translation",
        "config": {
          "language": {
            "sourceLanguage": sourceLang,
            "targetLanguage": targetLang
          }
        }
      }
    ],
    "pipelineRequestConfig": {
      "pipelineId": process.env.PIPELINE_ID
    }
  };

  try {
    const configResponse = await bhashiniAxios.post('/ulca/apis/v0/model/getModelsPipeline', configPayload);
    console.log('Config response:', JSON.stringify(configResponse.data, null, 2));

    const serviceConfig = configResponse.data.pipelineResponseConfig.find(config => 
      config.config.some(conf => conf.language.sourceLanguage === sourceLang && conf.language.targetLanguage === targetLang)
    );

    if (!serviceConfig) {
      console.error('Service configuration not found for the provided language pair');
      return res.status(404).json({ error: 'Service configuration not found for the provided language pair' });
    }

    const serviceId = serviceConfig.config[0].serviceId;
    const callbackUrl = configResponse.data.pipelineInferenceAPIEndPoint.callbackUrl;
    const inferenceApiKey = configResponse.data.pipelineInferenceAPIEndPoint.inferenceApiKey.value;

    console.log('Service ID:', serviceId);

    const computeHeaders = {
      'Content-Type': 'application/json',
      [configResponse.data.pipelineInferenceAPIEndPoint.inferenceApiKey.name]: inferenceApiKey,
    };

    const computePayload = {
      "pipelineTasks": [
        {
          "taskType": "translation",
          "config": {
            "language": {
              "sourceLanguage": sourceLang,
              "targetLanguage": targetLang
            },
            "serviceId": serviceId
          }
        }
      ],
      "inputData": {
        "input": [{ "source": text }]
      }
    };
    
    const computeResponse = await bhashiniAxios.post(callbackUrl, computePayload, { headers: computeHeaders });
    const translatedText = computeResponse.data.pipelineResponse[0].output[0].target;
    console.log('Translation Response:', translatedText);

    res.json({ translatedText: translatedText });
  } catch (error) {
    console.error('Error during translation:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
