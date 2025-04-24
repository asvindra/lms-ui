// pages/env.tsx
import { NextPage } from "next";

const EnvPage: NextPage = () => {
  return (
    <div>
      <h1>Environment Variables</h1>
      <p>NEXT_PUBLIC_BACKEND_URL: {process.env.NEXT_PUBLIC_API_URL}</p>
      <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      <p>NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL}</p>
    </div>
  );
};

export default EnvPage;
