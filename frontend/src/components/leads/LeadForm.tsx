import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import type { User } from "../../types/auth";
import { FOLLOW_UP_TYPES, LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES, type LeadFormValues } from "../../types/lead";

interface LeadFormProps {
  initialValues?: LeadFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  isAdmin?: boolean;
  salesUsers?: User[];
  onSubmit: (values: LeadFormValues) => Promise<void>;
}

type FormErrors = Partial<Record<keyof LeadFormValues, string>>;

const defaultValues: LeadFormValues = {
  name: "",
  email: "",
  status: "New",
  source: "Website",
  priority: "Medium",
  assignedTo: "",
  nextFollowUpAt: "",
  followUpType: "",
  followUpNote: "",
  statusNote: ""
};

function validate(values: LeadFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) errors.name = "Lead name is required.";
  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

export function LeadForm({
  initialValues,
  isAdmin = false,
  isSubmitting = false,
  onSubmit,
  salesUsers = [],
  serverError,
  submitLabel
}: LeadFormProps) {
  const mergedValues = useMemo(() => ({ ...defaultValues, ...initialValues }), [initialValues]);
  const [values, setValues] = useState<LeadFormValues>(mergedValues);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setValues(mergedValues);
  }, [mergedValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit({
      ...values,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      followUpNote: values.followUpNote?.trim(),
      statusNote: values.statusNote?.trim()
    });
  }

  return (
    <form className="grid gap-5 rounded-lg border border-stone-200 bg-white p-5" onSubmit={handleSubmit}>
      {serverError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {serverError}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          error={errors.name}
          label="Name"
          name="name"
          placeholder="Rahul Sharma"
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
        />
        <Input
          error={errors.email}
          label="Email"
          name="email"
          placeholder="rahul@example.com"
          type="email"
          value={values.email}
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
        />
        <Select
          label="Status"
          name="status"
          value={values.status}
          options={LEAD_STATUSES.map((status) => ({ label: status, value: status }))}
          onChange={(event) =>
            setValues((current) => ({ ...current, status: event.target.value as LeadFormValues["status"] }))
          }
        />
        <Select
          label="Source"
          name="source"
          value={values.source}
          options={LEAD_SOURCES.map((source) => ({ label: source, value: source }))}
          onChange={(event) =>
            setValues((current) => ({ ...current, source: event.target.value as LeadFormValues["source"] }))
          }
        />
        <Select
          label="Priority"
          name="priority"
          value={values.priority}
          options={LEAD_PRIORITIES.map((priority) => ({ label: priority, value: priority }))}
          onChange={(event) =>
            setValues((current) => ({ ...current, priority: event.target.value as LeadFormValues["priority"] }))
          }
        />
        {isAdmin ? (
          <Select
            label="Assigned sales user"
            name="assignedTo"
            value={values.assignedTo ?? ""}
            options={[
              { label: "Auto assign", value: "" },
              ...salesUsers.map((user) => ({ label: `${user.name} (${user.email})`, value: user._id ?? user.id }))
            ]}
            onChange={(event) => setValues((current) => ({ ...current, assignedTo: event.target.value }))}
          />
        ) : null}
        <Input
          label="Follow-up date"
          name="nextFollowUpAt"
          type="datetime-local"
          value={values.nextFollowUpAt ?? ""}
          onChange={(event) => setValues((current) => ({ ...current, nextFollowUpAt: event.target.value }))}
        />
        <Select
          label="Follow-up type"
          name="followUpType"
          value={values.followUpType ?? ""}
          options={[
            { label: "No follow-up type", value: "" },
            ...FOLLOW_UP_TYPES.map((type) => ({ label: type, value: type }))
          ]}
          onChange={(event) =>
            setValues((current) => ({ ...current, followUpType: event.target.value as LeadFormValues["followUpType"] }))
          }
        />
        <Input
          label="Follow-up note"
          name="followUpNote"
          placeholder="What should happen next?"
          value={values.followUpNote ?? ""}
          onChange={(event) => setValues((current) => ({ ...current, followUpNote: event.target.value }))}
        />
        <Input
          label="Status change note"
          name="statusNote"
          placeholder="Why is the status changing?"
          value={values.statusNote ?? ""}
          onChange={(event) => setValues((current) => ({ ...current, statusNote: event.target.value }))}
        />
      </div>
      <div className="flex justify-end">
        <Button icon={<Save className="h-4 w-4" />} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
