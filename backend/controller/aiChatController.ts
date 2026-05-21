import { Request, Response } from 'express';
import ChatQAModel from '../models/ChatQA';

const normalizeQuestion = (question: string) => question.trim().toLowerCase();

export const sendChat = async (req: Request, res: Response) => {
  try {
    const question = String(req.body.question || '').trim();
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const normalizedQuestion = normalizeQuestion(question);
    let entry = await ChatQAModel.findOne({ normalizedQuestion });

    if (entry) {
      entry.askCount += 1;
      entry.lastAsked = new Date();
      await entry.save();

      if (entry.answered && entry.answer) {
        return res.status(200).json({ success: true, answer: entry.answer, known: true });
      }

      return res.status(200).json({
        success: true,
        answer: "Thanks for the question! I'm still learning this topic, but your question has been saved so I can answer it better next time.",
        known: false,
        id: entry._id,
      });
    }

    entry = await ChatQAModel.create({
      question,
      normalizedQuestion,
      answered: false,
    });

    return res.status(200).json({
      success: true,
      answer: "Thanks for the question! I don't have a prepared answer yet, but I've saved it so similar questions can be answered from the knowledge base in the future.",
      known: false,
      id: entry._id,
    });
  } catch (error: any) {
    console.error('Chat route error:', error);
    return res.status(500).json({ message: 'Chat processing failed' });
  }
};

export const upsertChatKnowledge = async (req: Request, res: Response) => {
  try {
    const question = String(req.body.question || '').trim();
    const answer = String(req.body.answer || '').trim();

    if (!question || !answer) {
      return res.status(400).json({ message: 'Both question and answer are required' });
    }

    const normalizedQuestion = normalizeQuestion(question);
    const entry = await ChatQAModel.findOneAndUpdate(
      { normalizedQuestion },
      {
        question,
        normalizedQuestion,
        answer,
        answered: true,
        lastAsked: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, entry });
  } catch (error: any) {
    console.error('Knowledge upsert error:', error);
    return res.status(500).json({ message: 'Failed to save knowledge' });
  }
};

export const getKnowledge = async (_req: Request, res: Response) => {
  try {
    const entries = await ChatQAModel.find().sort({ lastAsked: -1 }).limit(200);
    return res.status(200).json({ success: true, entries });
  } catch (error: any) {
    console.error('Knowledge list error:', error);
    return res.status(500).json({ message: 'Failed to fetch knowledge base' });
  }
};
