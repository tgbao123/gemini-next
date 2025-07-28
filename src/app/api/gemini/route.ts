// File: app/api/gemini/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
  // Check authentication first
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Get the prompt from the request body
  const { prompt } = await req.json();

  // Validate input
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "Valid prompt is required" },
      { status: 400 }
    );
  }

  // Ensure the API key is set
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not found." },
      { status: 500 }
    );
  }

  try {
    // Initialize the GoogleGenerativeAI with your API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content based on the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Return the generated text
    return NextResponse.json({ text });

  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content." },
      { status: 500 }
    );
  }
}