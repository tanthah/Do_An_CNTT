import { createWorker } from 'tesseract.js';

export const extractTextFromImage = async (filePath) => {
    const worker = await createWorker('eng+vie');
    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();
    return text;
};
