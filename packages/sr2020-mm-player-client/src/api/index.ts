import { ErrorResponse, SpiritJarQr } from "sr2020-mm-event-engine";

export const isLoggedIn = async () => fetch('/api/isLoggedIn');

export async function loginUser(credentials: {
  username: string;
  password: string;
}): Promise<{ status: number; text: string; }> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  if (res.status !== 200) {
    const text = await res.text();
    return {
      status: res.status,
      text
    };
  }
  return {
    status: res.status,
    text: ''
  };
}

export async function logoutUser() {
  const res = await fetch('/api/logout', {
    method: 'POST',
  });
  return res;
}

export async function callSecureApi() {
  const res = await fetch('/api/secureEndpoint', {method: 'POST'});
  return res;
}

export async function getSpiritDataByQr(spiritJarQrString: string): Promise<ErrorResponse | SpiritJarQr> {
  const res = await fetch('/api/getSpiritDataByQr?' + new URLSearchParams({
    spiritJarQrString
  }));
  return await res.json();
}
