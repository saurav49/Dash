"use server";

export const getTemplate = async (prompt: string) => {
  try {
    const r = await fetch("http://localhost:3000/api/template", {
      method: "POST",
      body: JSON.stringify({ prompt }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await r.json();
    return res;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to generate content",
    };
  }
};

export const chatApi = async ({
  design,
  file,
  content,
}: {
  design: string;
  file: string;
  content: string;
}) => {
  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            parts: [
              {
                text: design,
              },
            ],
          },
          {
            role: "user",
            parts: [
              {
                text: file,
              },
            ],
          },
          {
            role: "user",
            parts: [
              {
                text: content,
              },
            ],
          },
        ],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await r.json();
    return res;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to generate content",
    };
  }
};
