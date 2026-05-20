import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { LeadForm } from "../components/leads/LeadForm";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";
import { createLead, getLead, getSalesUsers, updateLead } from "../services/leadApi";
import type { User } from "../types/auth";
import type { LeadFormValues } from "../types/lead";

interface LeadFormPageProps {
  mode: "create" | "edit";
}

export function LeadFormPage({ mode }: LeadFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [initialValues, setInitialValues] = useState<LeadFormValues | undefined>();
  const [salesUsers, setSalesUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toLocalDateTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const loadLead = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [lead, users] = await Promise.all([
        mode === "edit" && id ? getLead(id) : Promise.resolve(undefined),
        isAdmin ? getSalesUsers() : Promise.resolve([])
      ]);
      setSalesUsers(users);
      if (lead) {
        setInitialValues({
          assignedTo: lead.assignedTo?._id ?? lead.assignedTo?.id ?? "",
          email: lead.email,
          followUpNote: lead.followUpNote ?? "",
          followUpType: lead.followUpType ?? "",
          name: lead.name,
          nextFollowUpAt: toLocalDateTime(lead.nextFollowUpAt),
          priority: lead.priority,
          source: lead.source,
          status: lead.status,
          statusNote: ""
        });
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [id, isAdmin, mode]);

  useEffect(() => {
    void loadLead();
  }, [loadLead]);

  async function handleSubmit(values: LeadFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        ...values,
        nextFollowUpAt: values.nextFollowUpAt ? new Date(values.nextFollowUpAt).toISOString() : ""
      };
      const savedLead = mode === "create" ? await createLead(payload) : await updateLead(id ?? "", payload);
      navigate(`/leads/${savedLead.id ?? savedLead._id}`, { replace: true });
    } catch (saveError) {
      setSubmitError(getApiErrorMessage(saveError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingState label={mode === "create" ? "Preparing form" : "Loading lead"} />;
  if (error) return <ErrorState message={error} onRetry={loadLead} />;

  return (
    <div className="grid gap-5">
      <div>
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-950" to="/leads">
          <ArrowLeft className="h-4 w-4" />
          Back to leads
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal text-stone-950">
          {mode === "create" ? "Create lead" : "Edit lead"}
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Keep the record concise so Sales can scan and update it quickly.
        </p>
      </div>
      <LeadForm
        initialValues={initialValues}
        isAdmin={isAdmin}
        isSubmitting={isSubmitting}
        salesUsers={salesUsers}
        serverError={submitError}
        submitLabel={mode === "create" ? "Create lead" : "Save changes"}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
