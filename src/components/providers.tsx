"use client";

import { AuthProvider } from "@/lib/authContext";
import { DemoModeProvider } from "@/lib/demoModeContext";
import { LanguageProvider } from "@/lib/languageContext";
import { UserProvider } from "../lib/userContext";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <DemoModeProvider>
          <UserProvider>
            {children}
            <Toaster richColors position="top-right" />
          </UserProvider>
        </DemoModeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
