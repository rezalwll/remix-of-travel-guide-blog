// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { MelipayamakSmsProvider } from "./melipayamak.js";

const options = (fetch: typeof globalThis.fetch) => ({
  baseUrl: "https://rest.payamak-panel.com/api/SendSMS/",
  username: "test-user",
  apiKey: "test-api-key",
  otpBodyId: "557502",
  fetch,
});

const jsonResponse = (payload: unknown) => new Response(JSON.stringify(payload), {
  status: 200,
  headers: { "content-type": "application/json" },
});

describe("MelipayamakSmsProvider", () => {
  it("submits OTP values as a form without returning the code or credentials", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ Value: "987654321", RetStatus: 1, StrRetStatus: "Ok" })) as unknown as typeof globalThis.fetch;
    const provider = new MelipayamakSmsProvider(options(fetchMock));

    const result = await provider.send({ mobile: "09121234567", template: "OTP_LOGIN", variables: { code: "12345" }, requestId: "request-1" });

    expect(result).toEqual({ status: "queued", providerReference: "987654321" });
    expect(JSON.stringify(result)).not.toContain("12345");
    const [url, request] = vi.mocked(fetchMock).mock.calls[0];
    expect(String(url)).toBe("https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber");
    expect(request?.headers).toMatchObject({ "content-type": "application/x-www-form-urlencoded;charset=UTF-8", "x-request-id": "request-1" });
    const body = new URLSearchParams(String(request?.body));
    expect(Object.fromEntries(body)).toEqual({ username: "test-user", password: "test-api-key", text: "12345", to: "09121234567", bodyId: "557502" });
  });

  it("fails closed on rejected and malformed responses", async () => {
    const rejectedFetch = vi.fn(async () => jsonResponse({ Value: "-6", RetStatus: 0, StrRetStatus: "Rejected" })) as unknown as typeof globalThis.fetch;
    await expect(new MelipayamakSmsProvider(options(rejectedFetch)).send({ mobile: "09121234567", template: "otp", variables: { code: "12345" } })).rejects.toMatchObject({ category: "REJECTED", retryable: false, details: { providerCode: "0", providerValue: "-6" } });

    const malformedFetch = vi.fn(async () => jsonResponse({ ok: true })) as unknown as typeof globalThis.fetch;
    await expect(new MelipayamakSmsProvider(options(malformedFetch)).send({ mobile: "09121234567", template: "otp", variables: { code: "12345" } })).rejects.toMatchObject({ category: "MALFORMED_RESPONSE" });
  });

  it("validates OTP input before contacting the provider", async () => {
    const fetchMock = vi.fn() as unknown as typeof globalThis.fetch;
    const provider = new MelipayamakSmsProvider(options(fetchMock));
    await expect(provider.send({ mobile: "9121234567", template: "OTP_LOGIN", variables: { code: "12345" } })).rejects.toMatchObject({ code: "INVALID_REQUEST" });
    await expect(provider.send({ mobile: "09121234567", template: "OTP_LOGIN", variables: { code: "1234" } })).rejects.toMatchObject({ code: "INVALID_REQUEST" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps delivery status without exposing provider credentials", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ Value: "1", RetStatus: 1, StrRetStatus: "Ok" })) as unknown as typeof globalThis.fetch;
    const provider = new MelipayamakSmsProvider(options(fetchMock));
    await expect(provider.checkStatus("987654321")).resolves.toBe("sent");
    const [url, request] = vi.mocked(fetchMock).mock.calls[0];
    expect(String(url)).toBe("https://rest.payamak-panel.com/api/SendSMS/GetDeliveries2");
    expect(new URLSearchParams(String(request?.body)).get("recID")).toBe("987654321");
  });
});
