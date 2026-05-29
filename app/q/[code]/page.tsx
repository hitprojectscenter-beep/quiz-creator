import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { Brain } from "lucide-react";
import PublicQuizPlayer from "./PublicQuizPlayer";

// Use anonymous client (anon key) for public access
function createAnonClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

export default async function PublicQuizPage({ params }: { params: { code: string } }) {
  const supabase = createAnonClient();

  // Find test by share_code
  const { data: test, error } = await supabase
    .from("tests")
    .select("*, questions(*)")
    .eq("share_code", params.code.toUpperCase())
    .eq("allow_anonymous", true)
    .single();

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-md text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center mb-4">
            <Brain className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">המבחן לא נמצא</h1>
          <p className="text-slate-600 mb-6">
            הקישור שגוי או שהמבחן הוסר
            <br />
            <span className="text-xs text-slate-500 mt-2 block">קוד: {params.code}</span>
          </p>
          <Link href="/" className="btn-primary">לדף הבית</Link>
        </div>
      </div>
    );
  }

  // Sort questions
  const sortedQuestions = (test.questions || []).sort(
    (a: any, b: any) => a.question_order - b.question_order
  );

  return <PublicQuizPlayer test={{ ...test, questions: sortedQuestions }} />;
}
