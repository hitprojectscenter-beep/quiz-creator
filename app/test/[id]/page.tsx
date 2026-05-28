import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import TestPlayer from "./TestPlayer";

export default async function TakeTestPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/test/${params.id}`);

  const { data: test } = await supabase
    .from("tests")
    .select("*, questions(*), profiles!tests_creator_id_fkey(full_name)")
    .eq("id", params.id)
    .single();

  if (!test) notFound();

  // Sort questions by order
  const sortedQuestions = (test.questions || []).sort(
    (a: any, b: any) => a.question_order - b.question_order
  );

  return <TestPlayer test={{ ...test, questions: sortedQuestions }} />;
}
