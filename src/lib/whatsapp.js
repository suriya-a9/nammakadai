import { normalizeMobile } from "@/lib/mobileNumber";

// Template names and language codes must match the approved Meta templates exactly.
async function sendTemplate(phone, template, parameters = [], language) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId || !template) {
    console.warn("WhatsApp notification skipped: missing access token, phone number ID or template name", { template });
    return { skipped: true };
  }
  const normalized = normalizeMobile(phone);
  if (!normalized) throw new Error(`WhatsApp ${template}: invalid recipient phone number`);
  const version = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";
  const body = {
    messaging_product: "whatsapp",
    to: normalized.slice(1),
    type: "template",
    template: {
      name: template,
      language: { code: language || process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US" },
      ...(parameters.length ? {
        components: [{ type: "body", parameters: parameters.map(value => ({ type: "text", text: String(value ?? "").trim() })) }]
      } : {})
    }
  };
  if (parameters.some(value => !String(value ?? "").trim())) {
    throw new Error(`WhatsApp ${template}: one or more required template variables are empty`);
  }
  const result = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(phoneId)}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  });
  const responseText = await result.text();
  let response;
  try { response = JSON.parse(responseText); } catch { response = { raw: responseText.slice(0, 600) }; }
  if (!result.ok || response?.error) {
    const detail = response?.error;
    console.error("WhatsApp template rejected", {
      template,
      language: body.template.language.code,
      parameterCount: parameters.length,
      status: result.status,
      code: detail?.code,
      subcode: detail?.error_subcode,
      message: detail?.message,
      details: detail?.error_data?.details
    });
    throw new Error(`WhatsApp ${template} failed (${result.status}): ${detail?.message || responseText.slice(0, 300)}`);
  }
  console.info("WhatsApp template accepted", { template, messageId: response?.messages?.[0]?.id });
  return response;
}

const statusSentence = {
  placed: "Your order has been placed.",
  confirmed: "Your order has been confirmed.",
  processing: "Your order is being processed.",
  shipped: "Your order has been shipped.",
  delivered: "Your order has been delivered.",
  cancelled: "Your order has been cancelled."
};

export const sendWelcomeWhatsApp = phone =>
  sendTemplate(phone, process.env.WHATSAPP_WELCOME_TEMPLATE || "nammakadai_welcome", [], process.env.WHATSAPP_WELCOME_LANGUAGE);

export const sendOrderConfirmationWhatsApp = (phone, order) =>
  sendTemplate(phone, process.env.WHATSAPP_ORDER_TEMPLATE || "nammakadai_order_placed_v2", [
    order.name || "Customer", order.orderNumber, Number(order.total).toFixed(2)
  ], process.env.WHATSAPP_ORDER_LANGUAGE);

export const sendOrderStatusWhatsApp = (phone, order) =>
  sendTemplate(phone, process.env.WHATSAPP_STATUS_TEMPLATE || "nammakadai_order_status", [
    order.name || "Customer", order.orderNumber,
    statusSentence[String(order.status || "").toLowerCase()] || `Your order status is ${String(order.status || "updated")}.`
  ], process.env.WHATSAPP_STATUS_LANGUAGE);

// Separate approved Utility template for admin order notifications.
// Body variables: {{1}} customer name, {{2}} order number, {{3}} order total.
export const sendAdminNewOrderWhatsApp = order =>
  sendTemplate(
    process.env.WHATSAPP_ADMIN_PHONE || "916382580462",
    process.env.WHATSAPP_ADMIN_ORDER_TEMPLATE || "nammakadai_admin_new_order",
    [
      String(order.phone || order.customer?.phone || "Not provided"),
      order.orderNumber,
      Number(order.total).toFixed(2)
    ],
    process.env.WHATSAPP_ADMIN_ORDER_LANGUAGE || "en"
  );
