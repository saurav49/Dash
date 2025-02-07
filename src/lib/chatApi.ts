export const chatApi = async ({
  design,
  file,
  content,
  onUpdate,
}: {
  design: string;
  file: string;
  content: string;
  onUpdate: (data: string) => void;
}) => {
  try {
    const r = await fetch("http://localhost:3000/api/chat", {
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
    if (!r.ok) {
      throw new Error(r.statusText);
    }
    const reader = r.body?.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let result = "";

    if (reader) {
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const decodedChunk = decoder.decode(value, { stream: true });
        result += decodedChunk;
        onUpdate(result);
      }
    }
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to generate content",
    };
  }
};
