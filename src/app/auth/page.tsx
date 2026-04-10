"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/authContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useLang } from "@/lib/languageContext";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const signUpSchema = signInSchema.extend({
  full_name: z.string().min(2),
  phone: z.string().min(8),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();

  const signInForm = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });
  const signUpForm = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });

  return (
    <div className={`space-y-4 ${lang === "hi" ? "lang-hi" : ""}`}>
      <SectionHeader
        title={t("authentication")}
        subtitle={lang === "hi" ? "साइन इन करें या अपना एक्सप्लोरर प्रोफाइल बनाएं" : "Sign in or create your explorer profile"}
      />
      <div className="rounded-2xl border border-white/10 bg-[var(--bg-card)]/80 p-4">
      <Tabs.Root defaultValue="signin" className="mt-4">
        <Tabs.List className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
          <Tabs.Trigger value="signin" className="min-h-[44px] rounded-lg bg-white/10 px-4 py-2 text-sm">
            {t("signIn")}
          </Tabs.Trigger>
          <Tabs.Trigger value="signup" className="min-h-[44px] rounded-lg bg-white/10 px-4 py-2 text-sm">
            {t("signUp")}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="signin" className="mt-4">
          <form
            className="space-y-3"
            onSubmit={signInForm.handleSubmit(async (values) => {
              try {
                await signIn(values.email, values.password);
                toast.success("Welcome back");
                router.push("/");
              } catch (error) {
                toast.error((error as Error).message);
              }
            })}
          >
            <input
              className="min-h-[44px] w-full rounded-xl bg-black/20 px-3"
              placeholder={t("email")}
              {...signInForm.register("email")}
            />
            <input
              className="min-h-[44px] w-full rounded-xl bg-black/20 px-3"
              placeholder={t("password")}
              type="password"
              {...signInForm.register("password")}
            />
            <button className="glow min-h-[46px] w-full rounded-xl bg-gold font-semibold text-black" type="submit">
              {t("continue")}
            </button>
          </form>
        </Tabs.Content>

        <Tabs.Content value="signup" className="mt-4">
          <form
            className="space-y-3"
            onSubmit={signUpForm.handleSubmit(async (values) => {
              try {
                await signUp(values.email, values.password, values.full_name, values.phone);
                toast.success("Account created. Please sign in.");
              } catch (error) {
                toast.error((error as Error).message);
              }
            })}
          >
            <input
              className="min-h-[44px] w-full rounded-xl bg-black/20 px-3"
              placeholder={t("fullName")}
              {...signUpForm.register("full_name")}
            />
            <input
              className="min-h-[44px] w-full rounded-xl bg-black/20 px-3"
              placeholder={t("phone")}
              {...signUpForm.register("phone")}
            />
            <input
              className="min-h-[44px] w-full rounded-xl bg-black/20 px-3"
              placeholder={t("email")}
              {...signUpForm.register("email")}
            />
            <input
              className="min-h-[44px] w-full rounded-xl bg-black/20 px-3"
              placeholder={t("password")}
              type="password"
              {...signUpForm.register("password")}
            />
            <button className="min-h-[46px] w-full rounded-xl bg-teal font-semibold text-black" type="submit">
              {t("createAccount")}
            </button>
          </form>
        </Tabs.Content>
      </Tabs.Root>
      </div>
    </div>
  );
}
