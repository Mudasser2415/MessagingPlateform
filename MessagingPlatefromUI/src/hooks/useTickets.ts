import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "../services/ticketService";
import type {
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketQueryParams,
} from "../services/ticketService";

const TICKETS_KEY = ["tickets"];

// ── Queries ───────────────────────────────────────────────────────────────────

export const useTickets = (params: TicketQueryParams) =>
  useQuery({
    queryKey: [...TICKETS_KEY, params],
    queryFn: () => ticketService.getAll(params),
    placeholderData: (prev) => prev,
  });

export const useTicket = (id: string) =>
  useQuery({
    queryKey: [...TICKETS_KEY, id],
    queryFn: () => ticketService.getById(id),
    enabled: !!id,
  });

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useCreateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTicketRequest) => ticketService.create(body),
    onSuccess: () => qc.refetchQueries({ queryKey: TICKETS_KEY }),
  });
};

export const useUpdateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTicketRequest }) =>
      ticketService.update(id, body),
    onSuccess: () => qc.refetchQueries({ queryKey: TICKETS_KEY }),
  });
};

export const useCloseTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketService.close(id),
    onSuccess: () => qc.refetchQueries({ queryKey: TICKETS_KEY }),
  });
};
