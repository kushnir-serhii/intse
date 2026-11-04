// PasswordCredential is Chromium-only, so TypeScript's DOM lib doesn't declare it
type PasswordCredentialCtor = new (data: {
  id: string;
  password: string;
  name?: string;
}) => Credential;

// Ask the browser's password manager (Google Password Manager, Edge, …) to save
// the login. Our forms submit via fetch, so the browser's own "form submitted →
// navigated" heuristic doesn't always fire — this makes it explicit.
// Extensions like 1Password/Bitwarden pick up the form via name/autocomplete attrs.
export async function storeCredential(username: string, password: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const Ctor = (window as unknown as { PasswordCredential?: PasswordCredentialCtor })
    .PasswordCredential;
  if (!Ctor || !navigator.credentials) return;

  try {
    await navigator.credentials.store(new Ctor({ id: username, password, name: username }));
  } catch {
    // User dismissed or browser refused — saving is best-effort
  }
}
