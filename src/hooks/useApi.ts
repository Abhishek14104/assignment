import { useEffect, useState } from "react";

const useApi = (pageNumber: number) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${pageNumber}`
        );
        if (!response.ok) {
          throw new Error("API issue");
        }
        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, [pageNumber]);

  return { data, loading, error };
};

export default useApi;
