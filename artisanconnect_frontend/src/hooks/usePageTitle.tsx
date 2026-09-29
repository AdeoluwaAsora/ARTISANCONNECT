import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const PageTitleContext = createContext<{
  title: string;
  setTitle: (title: string) => void;
} | null>(null);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Dashboard");
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitleContext() {
  const ctx = useContext(PageTitleContext);
  if (!ctx) throw new Error("usePageTitleContext must be used within PageTitleProvider");
  return ctx;
}

/** Call at the top of any dashboard page to set the Topbar's heading. */
export function usePageTitle(title: string) {
  const { setTitle } = usePageTitleContext();
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
}
