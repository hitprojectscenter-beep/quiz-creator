import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import ResultsView from "./ResultsView";

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: attempt } = await supabase
    .from("attempts")
    .select("*, tests(*, questions(*))")
    .eq("id", params.id)
    .single();

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <p>התוצאות לא נמצאו</p>
          <Link href="/dashboard" className="btn-primary mt-4">חזרה לדשבורד</Link>
        </div>
      </div>
    );
  }

  return <ResultsView attempt={attempt} />;
}
