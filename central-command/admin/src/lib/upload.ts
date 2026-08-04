const API_BASE = '/api/v1';

export async function uploadFile(file: File, bucket: string): Promise<string> {
  const token = localStorage.getItem('accessToken');
  const form = new FormData();
  form.append('file', file);
  form.append('bucket', bucket);
  const res = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error?.message || 'Upload failed');
  }
  const fileRecord = await res.json();
  return `${API_BASE}/uploads/${fileRecord.id}`;
}
