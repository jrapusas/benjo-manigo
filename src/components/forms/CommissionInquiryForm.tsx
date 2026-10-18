import { useMemo, useState } from 'react';
import { paintingTypeOptions } from '../../lib/gallery/categories';

const SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'custom', label: 'Custom (describe in notes)' },
];

const BUDGET_OPTIONS = [
  {
    value: 'discuss',
    label: 'To be discussed with the artist',
  },
];

type FieldErrors = Partial<Record<string, string>>;

export default function CommissionInquiryForm() {
  const paintingTypes = useMemo(() => paintingTypeOptions(), []);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setStatus('submitting');

    const form = event.currentTarget;
    const data = new FormData(form);

    if (String(data.get('company') ?? '').trim()) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      return;
    }

    const nextErrors: FieldErrors = {};
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const location = String(data.get('location') ?? '').trim();

    if (name.length < 2 || name.length > 120) nextErrors.name = 'Enter your name (2–120 characters).';
    if (!email.includes('@')) nextErrors.email = 'Enter a valid email address.';
    if (!location) nextErrors.location = 'Enter your city and country.';
    if (!data.get('painting_type')) nextErrors.painting_type = 'Choose a painting type.';
    if (!data.get('size_preference')) nextErrors.size_preference = 'Choose a size preference.';
    if (!data.get('budget_range')) nextErrors.budget_range = 'Choose a budget option.';

    const file = data.get('reference_image');
    if (file instanceof File && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        nextErrors.reference_image = 'Reference image must be 5 MB or smaller.';
      } else if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        nextErrors.reference_image = 'Use JPEG, PNG, or WebP for reference images.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus('error');
      setMessage('Fix the highlighted fields and try again.');
      return;
    }

    data.set('website_attribution', 'source=benjo-manigo-website');

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        body: data,
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        setStatus('error');
        setMessage(payload?.error ?? 'Could not send your inquiry. Please try again.');
        return;
      }

      window.location.assign('/thanks');
    } catch {
      setStatus('error');
      setMessage('Network error. Check your connection and try again.');
    }
  }

  return (
    <form
      className="mx-auto max-w-xl space-y-block-sm"
      onSubmit={onSubmit}
      encType="multipart/form-data"
      noValidate
    >
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="website_attribution" value="source=benjo-manigo-website" />

      <div>
        <label className="block text-sm font-medium" htmlFor="name">
          Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          className="mt-1 w-full rounded-md border border-subtle bg-background px-3 py-2"
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name ? (
          <p id="name-error" className="mt-1 text-sm text-red-700">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="email">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-subtle bg-background px-3 py-2"
          aria-invalid={errors.email ? 'true' : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email ? (
          <p id="email-error" className="mt-1 text-sm text-red-700">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="phone">
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="mt-1 w-full rounded-md border border-subtle bg-background px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="location">
          City / country *
        </label>
        <input
          id="location"
          name="location"
          type="text"
          required
          className="mt-1 w-full rounded-md border border-subtle bg-background px-3 py-2"
          aria-invalid={errors.location ? 'true' : undefined}
          aria-describedby={errors.location ? 'location-error' : undefined}
        />
        {errors.location ? (
          <p id="location-error" className="mt-1 text-sm text-red-700">
            {errors.location}
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="painting_type">
          Painting type *
        </label>
        <select
          id="painting_type"
          name="painting_type"
          required
          className="mt-1 w-full rounded-md border border-subtle bg-background px-3 py-2"
          defaultValue=""
          aria-invalid={errors.painting_type ? 'true' : undefined}
        >
          <option value="" disabled>
            Select a type
          </option>
          {paintingTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.painting_type ? (
          <p className="mt-1 text-sm text-red-700">{errors.painting_type}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="size_preference">
          Size preference *
        </label>
        <select
          id="size_preference"
          name="size_preference"
          required
          className="mt-1 w-full rounded-md border border-subtle bg-background px-3 py-2"
          defaultValue=""
        >
          <option value="" disabled>
            Select a size
          </option>
          {SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.size_preference ? (
          <p className="mt-1 text-sm text-red-700">{errors.size_preference}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="budget_range">
          Budget *
        </label>
        <select
          id="budget_range"
          name="budget_range"
          required
          className="mt-1 w-full rounded-md border border-subtle bg-background px-3 py-2"
          defaultValue="discuss"
        >
          {BUDGET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="deadline">
          Deadline (optional)
        </label>
        <input
          id="deadline"
          name="deadline"
          type="text"
          placeholder="When do you need it?"
          className="mt-1 w-full rounded-md border border-subtle bg-background px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="notes">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="mt-1 w-full rounded-md border border-subtle bg-background px-3 py-2"
          placeholder="Subject, style, story, dimensions…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="reference_image">
          Reference image (optional, max 5 MB)
        </label>
        <input
          id="reference_image"
          name="reference_image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 w-full text-sm"
        />
        {errors.reference_image ? (
          <p className="mt-1 text-sm text-red-700">{errors.reference_image}</p>
        ) : null}
      </div>

      <p className="text-sm text-muted">
        Your details are used only to respond to this commission inquiry. We do not sell your
        information.
      </p>

      <div aria-live="polite" className="min-h-[1.25rem] text-sm text-red-700">
        {message}
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full sm:w-auto"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  );
}
