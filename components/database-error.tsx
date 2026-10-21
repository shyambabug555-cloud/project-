type SupabaseError = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  hint?: unknown;
};

function getErrorDetails(error: unknown): SupabaseError {
  if (error instanceof Error) {
    return {
      message: error.message,
      ...(typeof error.cause === "object" && error.cause !== null
        ? (error.cause as SupabaseError)
        : {}),
    };
  }
  if (typeof error === "object" && error !== null) {
    return error as SupabaseError;
  }
  return { message: typeof error === "string" ? error : "Unknown database error" };
}

export function DatabaseError({ error }: { error: unknown }) {
  const details = getErrorDetails(error);
  const message =
    typeof details.message === "string" ? details.message : "Unknown database error";
  const code = typeof details.code === "string" ? details.code : null;
  const missingTable = code === "PGRST205";

  return (
    <div
      role="alert"
      className="rounded-[28px] border border-destructive/30 bg-destructive/5 p-6 text-foreground"
    >
      <h2 className="text-lg font-semibold">Could not load your photo library</h2>
      {code && <p className="mt-2 text-xs font-medium text-destructive">Supabase error {code}</p>}
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {typeof details.details === "string" && details.details && (
        <p className="mt-2 text-sm text-muted-foreground">{details.details}</p>
      )}
      {typeof details.hint === "string" && details.hint && (
        <p className="mt-2 text-sm text-muted-foreground">Hint: {details.hint}</p>
      )}
      <p className="mt-3 text-sm text-muted-foreground">
        {missingTable ? (
          <>
            Supabase cannot find this table in the <code className="rounded bg-muted px-1.5 py-0.5">public</code>{" "}
            API schema. Open the SQL Editor for the same project as your app URL and run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">supabase/migration.sql</code>. If the
            tables already exist, refresh the API schema cache with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">NOTIFY pgrst, &apos;reload schema&apos;;</code>.
            For demo photos, run <code className="rounded bg-muted px-1.5 py-0.5">supabase/seed.sql</code>{" "}
            only after the migration succeeds, then refresh this page.
          </>
        ) : (
          <>
            Check your Supabase URL and publishable key, database permissions, and the SQL setup in{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">supabase/migration.sql</code>.
          </>
        )}
      </p>
    </div>
  );
}
