interface LoadMoreButtonProps {
  hasMore: boolean;
  isLoading: boolean;
  hasError: boolean;
  onClick: () => void;
}

export default function LoadMoreButton({ hasMore, isLoading, hasError, onClick }: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="text-sm font-medium text-sun-mid hover:opacity-80 light:text-sun-deep"
      >
        {isLoading ? "Carregando..." : "Carregar mais"}
      </button>
      {hasError && <p className="mt-2 text-sm text-sun-deep">Não foi possível carregar agora. Tente de novo.</p>}
    </div>
  );
}
