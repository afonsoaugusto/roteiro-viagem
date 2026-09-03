import { loginAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <p className="text-sm tracking-[0.2em] text-[#0f3d3e]/70 uppercase">Viagem</p>
      <h1
        className="mt-2 text-4xl text-[#0f3d3e]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Roteiro
      </h1>
      <p className="mt-3 text-[#163032]/75">
        Marque o que já foi feito e o que ainda falta. Aberto no celular, sem nome na tela.
      </p>

      <form action={loginAction} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Usuário</span>
          <input
            name="user"
            autoComplete="username"
            required
            className="w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0f3d3e]/30"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Senha</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#0f3d3e]/30"
          />
        </label>
        {error ? (
          <p className="text-sm text-[#c45c3e]">Usuário ou senha inválidos.</p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-2xl bg-[#0f3d3e] py-3.5 font-medium text-white"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
