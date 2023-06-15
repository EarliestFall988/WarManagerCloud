export const LoadingSpinner = () => {
  return (
    <div
      className="inline-block  h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
    ></div>
  );
};

export const LoadingPage = () => {
  return (
    <div className="absolute right-0 top-0 flex h-screen w-screen items-center justify-center bg-zinc-800">
      <LoadingSpinner />
    </div>
  );
};

export const LoadingHeader: React.FC<{ title: string, loading: boolean }> = ({ title, loading }) => {

  return (
    <>
      {loading && (
        <div className="flex flex-col items-center justify-center gap-2 py-10">
          <LoadingSpinner />
          <p className="text-xl font-bold text-zinc-300">{title}</p>
        </div>
      )}
    </>
  )
}
