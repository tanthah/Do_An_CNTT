import mammoth from 'mammoth';

export const extractTextFromDocx = async (filePath) => {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
};
