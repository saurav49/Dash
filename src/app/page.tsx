"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";
import { MoveRightIcon } from "lucide-react";
import { createFileStructure } from "@/lib/utils";
import { FileStructure } from "@/types/types";
import { FileExplorer } from "@/components/ui/file-explorer";
import { chatApi } from "@/lib/chatApi";
import { getTemplate } from "@/lib/getTemplate";
import { useRouter } from "next/navigation";
export default function Home() {
  const [chatResponse, setChatResponse] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [fileStructure, setFileStructure] = useState<FileStructure | undefined>(
    undefined
  );

  const router = useRouter();
  const handleFormSubmit = async () => {
    // create a project for the user and navigate to the url (/:projectId)
    router.push(`/123?prompt=${encodeURIComponent(prompt)}`);
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, formAction] = useActionState(handleFormSubmit, null);
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <h1 className="text-3xl font-semibold">What do you want to build?</h1>
      <p className="text-sm font-normal mt-2 mb-4 text-center">
        Prompt, run, edit, and deploy full-stack web apps.
      </p>
      <form className="relative">
        <Textarea
          className="w-[500px] min-h-[70px]"
          placeholder="Type your message here."
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button
          formAction={formAction}
          className="absolute right-0 bottom-1/2 translate-y-1/2 flex items-center justify-center"
        >
          <MoveRightIcon />
        </Button>
      </form>
      <Textarea className="w-[500px] h-[300px]" value={chatResponse} readOnly />
      {fileStructure && <FileExplorer fileStructure={fileStructure} />}
    </div>
  );
}
