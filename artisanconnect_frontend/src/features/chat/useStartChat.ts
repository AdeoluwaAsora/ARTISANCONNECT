import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/api/chatApi";

/** Opens (or creates) a chat with someone and goes to it on the Messages page. */
export function useStartChat() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [startingWith, setStartingWith] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startChat = async (participantId: string, jobId?: string) => {
    setStartingWith(participantId);
    setError(null);
    try {
      const conversation = await chatApi.startConversation(participantId, jobId);
      await queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      navigate(`/messages?c=${conversation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open the chat. Please try again.");
    } finally {
      setStartingWith(null);
    }
  };

  return {
    startChat,
    /** The participant a chat is currently being opened with, for button spinners. */
    startingWith,
    error,
  };
}
