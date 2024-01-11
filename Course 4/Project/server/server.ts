import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { spawn } from 'child_process';
import axios from 'axios';

const app: express.Application = express();
const port: string | number = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/predict', async (req: Request, res: Response) => {
    try {
        var text: string = req.body.text;
  
        if (!text) {
            return res.status(400).send({ message: 'No text provided for prediction.' });
        }

        // Simple check to see if text contains non-ASCII characters (assuming non-English)
        if (/[^\x00-\x7F]/.test(text)) {
            // Set up your translation request
            const translationRequest = {
                method: 'GET',
                url: 'https://translated-mymemory---translation-memory.p.rapidapi.com/get',
                params: {
                    langpair: 'th|en',
                    q: text,
                    mt: '1',
                    onlyprivate: '0',
                    de: 'your-email@example.com'
                },
                headers: {
                    'X-RapidAPI-Key': '1126bf57b2mshd99a5d457783a9bp18a072jsn9f4a518e473d',
                    'X-RapidAPI-Host': 'translated-mymemory---translation-memory.p.rapidapi.com'
                }
            };

            // Make the translation request
            const translationResponse = await axios.request(translationRequest);

            if (translationResponse.data && translationResponse.data.responseData && translationResponse.data.responseData.translatedText) {
                text = translationResponse.data.responseData.translatedText;
            }
        }

        // Rest of your prediction logic
        const pythonProcess = spawn('python', ['predict.py']);

        pythonProcess.stdin.write(JSON.stringify({ text }));
        pythonProcess.stdin.end();

        let dataToSend: string = '';

        pythonProcess.stdout.on('data', (data: Buffer) => {
            dataToSend += data.toString();
        });

        pythonProcess.stderr.on('data', (data: Buffer) => {
            console.error(`stderr: ${data}`);
        });

        pythonProcess.on('close', (code: number) => {
            if(code === 0) {
                res.send(dataToSend);
            } else {
                res.status(500).send({ message: 'Error during prediction.' });
            }
        });
    } catch(err) {
        console.error('Error:', err);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
