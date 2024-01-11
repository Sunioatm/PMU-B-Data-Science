"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.post('/predict', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var text = req.body.text;
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
            const translationResponse = yield axios_1.default.request(translationRequest);
            if (translationResponse.data && translationResponse.data.responseData && translationResponse.data.responseData.translatedText) {
                text = translationResponse.data.responseData.translatedText;
            }
        }
        // Rest of your prediction logic
        const pythonProcess = (0, child_process_1.spawn)('python', ['predict.py']);
        pythonProcess.stdin.write(JSON.stringify({ text }));
        pythonProcess.stdin.end();
        let dataToSend = '';
        pythonProcess.stdout.on('data', (data) => {
            dataToSend += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                res.send(dataToSend);
            }
            else {
                res.status(500).send({ message: 'Error during prediction.' });
            }
        });
    }
    catch (err) {
        console.error('Error:', err);
        res.status(500).send({ message: 'Internal server error' });
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
