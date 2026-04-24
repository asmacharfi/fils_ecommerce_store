import Container from "@/components/ui/container";

export default function AccountOrdersLoading() {
  return (
    <Container>
      <div className="mx-auto max-w-3xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-48 rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-full max-w-md rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="mt-10 space-y-6">
          <div className="h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
    </Container>
  );
}
