"use client";

import LoginForm from "../../../components/Auth/LoginForm";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectAfterLogin = searchParams.get("redirect") || "/dashboard";

  return <LoginForm redirectAfterLogin={redirectAfterLogin} />;
}
