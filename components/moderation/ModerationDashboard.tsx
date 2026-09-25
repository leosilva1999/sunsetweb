"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Tabs from "@/components/ui/Tabs";
import ReportsQueue from "@/components/moderation/ReportsQueue";
import LegalDocumentEditor from "@/components/moderation/LegalDocumentEditor";
import UserRoleManager from "@/components/moderation/UserRoleManager";
import { useAuth, hasStoredAuth } from "@/lib/hooks/useAuth";

const REPORTS_TAB = "Denúncias";
const TERMS_TAB = "Termos de Uso";
const PRIVACY_TAB = "Política de Privacidade";
const USERS_TAB = "Usuários";
const ADMIN_TABS = [REPORTS_TAB, TERMS_TAB, PRIVACY_TAB, USERS_TAB];

export default function ModerationDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(REPORTS_TAB);

  // hasStoredAuth() lê o localStorage direto (sempre correto assim que o JS do
  // cliente roda); `user` vem do useSyncExternalStore e pode levar um tick a mais
  // pra resolver na hidratação - por isso a checagem de "não logado" usa a primeira
  // e a de papel espera `user` resolver antes de agir, pra não redirecionar à toa
  // um moderador/admin de verdade por causa desse atraso de um frame.
  useEffect(() => {
    if (!hasStoredAuth()) {
      router.push("/login?redirect=/moderation");
      return;
    }
    if (user && user.role === "User") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.role === "User") return null;

  const isAdmin = user.role === "Admin";
  const visibleTabs = isAdmin ? ADMIN_TABS : [REPORTS_TAB];

  return (
    <div>
      <Tabs options={visibleTabs} active={activeTab} onChange={setActiveTab} />
      {activeTab === REPORTS_TAB && <ReportsQueue />}
      {isAdmin && activeTab === TERMS_TAB && <LegalDocumentEditor documentType="TermsOfService" />}
      {isAdmin && activeTab === PRIVACY_TAB && <LegalDocumentEditor documentType="PrivacyPolicy" />}
      {isAdmin && activeTab === USERS_TAB && <UserRoleManager />}
    </div>
  );
}
