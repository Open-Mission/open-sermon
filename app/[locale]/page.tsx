import { createClient } from "@/lib/supabase/server";
import { useTranslations } from "next-intl";

export default async function Page() {
  const supabase = await createClient();

  const { data: todos } = await supabase.from("todos").select();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <h1 className="text-4xl font-bold mb-8">Todos</h1>
      <ul className="w-full max-w-md space-y-4">
        {todos?.length ? (
          todos.map((todo) => (
            <li key={todo.id} className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
              {todo.name}
            </li>
          ))
        ) : (
          <li className="text-muted-foreground italic">No todos found.</li>
        )}
      </ul>
    </div>
  );
}
