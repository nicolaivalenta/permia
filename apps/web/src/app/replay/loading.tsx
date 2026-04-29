export default function ReplayLoading() {
  return (
    <main className="min-h-screen bg-[#040406] pt-24 text-white">
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-10 md:py-14" role="status" aria-live="polite">
        <div>
          <p className="mono text-xs font-bold uppercase tracking-[0.22em] text-[#7d8ba0]">
            Loading replay
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
            Reconstructing the workflow timeline.
          </h1>
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-h-[28rem] border border-white/12 bg-[#080a0d] p-5">
            <div className="h-8 w-56 bg-white/10" />
            <div className="mt-8 grid gap-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="grid gap-3 border-t border-white/10 pt-4 md:grid-cols-[4.5rem_1fr_8rem]">
                  <div className="h-5 bg-white/10" />
                  <div className="grid gap-2">
                    <div className="h-5 w-48 bg-white/10" />
                    <div className="h-4 w-full max-w-xl bg-white/10" />
                  </div>
                  <div className="min-h-11 bg-white/10" />
                </div>
              ))}
            </div>
          </div>
          <div className="min-h-[18rem] border border-white/12 bg-[#080a0d] p-5">
            <div className="h-7 w-32 bg-white/10" />
            <div className="mt-6 grid gap-4">
              <div className="h-4 w-full bg-white/10" />
              <div className="h-4 w-5/6 bg-white/10" />
              <div className="h-4 w-2/3 bg-white/10" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
