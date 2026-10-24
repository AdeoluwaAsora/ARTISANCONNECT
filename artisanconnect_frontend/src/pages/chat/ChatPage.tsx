import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiMessageCircle } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { chatApi } from "@/api/chatApi";
import { ConversationList } from "@/features/chat/components/ConversationList";
import { ChatWindow } from "@/features/chat/components/ChatWindow";
import styles from "./ChatPage.module.css";

export function ChatPage() {
  usePageTitle("Messages");
  const [searchParams, setSearchParams] = useSearchParams();
  // The open conversation lives in the URL (?c=id), so "Message" buttons
  // elsewhere can link straight to it.
  const activeId = searchParams.get("c");

  const {
    data: conversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () => chatApi.getConversations(),
  });

  const activeConversation = conversations?.find((c) => c.id === activeId) ?? null;

  const selectConversation = (id: string) => setSearchParams({ c: id });

  return (
    <div className={styles.page}>
      <aside
        className={`${styles.sidebar} ${activeConversation ? styles.sidebarHiddenMobile : ""}`}
      >
        {isLoading ? (
          <p className="body-sm">Loading conversations…</p>
        ) : error ? (
          <p className="body-sm" role="alert">
            {error instanceof Error ? error.message : "Couldn't load your conversations."}
          </p>
        ) : (
          <ConversationList
            conversations={conversations ?? []}
            activeId={activeId}
            onSelect={selectConversation}
          />
        )}
      </aside>

      <div
        className={`${styles.main} ${activeConversation ? "" : styles.mainHiddenMobile}`}
      >
        {activeConversation ? (
          <>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => setSearchParams({})}
            >
              <FiArrowLeft size={16} /> Back to conversations
            </button>
            <ChatWindow key={activeConversation.id} conversation={activeConversation} />
          </>
        ) : (
          <div className={styles.emptyState}>
            <FiMessageCircle size={40} aria-hidden="true" />
            <p className="body-base">Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
