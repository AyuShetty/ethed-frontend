import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LoginForm from "./_components/LoginForm";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";


export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) redirect("/");

  return <LoginForm />;
}

