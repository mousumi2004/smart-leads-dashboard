import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../services/api";
import { getLeads } from "../services/leadApi";
import type { PaginationMeta } from "../types/api";
import type { Lead, LeadFilters } from "../types/lead";

export function useLeads(filters: LeadFilters) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getLeads(filters);
      setLeads(response.data);
      setMeta(response.meta);
    } catch (fetchError) {
      setError(getApiErrorMessage(fetchError));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  return { leads, meta, isLoading, error, refetch: fetchLeads };
}
