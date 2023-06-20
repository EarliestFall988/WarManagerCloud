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

export const SKCubeSpinner = () => (
  <div className="sk-cube-grid">
    <div className="sk-cube sk-cube1"></div>
    <div className="sk-cube sk-cube2"></div>
    <div className="sk-cube sk-cube3"></div>
    <div className="sk-cube sk-cube4"></div>
    <div className="sk-cube sk-cube5"></div>
    <div className="sk-cube sk-cube6"></div>
    <div className="sk-cube sk-cube7"></div>
    <div className="sk-cube sk-cube8"></div>
    <div className="sk-cube sk-cube9"></div>
  </div>
)


export const LoadingPageWithHeader: React.FC<{ title: string }> = ({ title }) => {


  return (
    <div className="absolute right-0 top-0 h-screen w-screen bg-black">
      <div className="flex flex-col w-full items-center min-h-[100vh] justify-center text-center">
        <SKCubeSpinner />
        {title &&
          <p className="font-bold text-zinc-200 fade-y-long">{title}</p>
        }
      </div>
    </div>
  )
}