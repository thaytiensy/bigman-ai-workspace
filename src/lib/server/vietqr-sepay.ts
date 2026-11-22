/**
 * ==============================================================================
 * MODULE THANH TOÁN VIETQR & XỬ LÝ WEBHOOK SEPAY (IDEMPOTENCY & AUTO-UPGRADE)
 * DỰ ÁN: TỔ CHỨC NHÂN VIÊN AI
 * LIÊN HỆ: Zalo 0353205414 | Email: thaytiensy@gmail.com
 * ==============================================================================
 * - Chỉ đọc cấu hình ngân hàng VietQR từ biến môi trường (KHÔNG hardcode STK/tên TK).
 * - Khi chưa cấu hình biến môi trường VietQR: trả về vietqrConfigured=false,
 *   qrImageUrl=null cùng thông tin Zalo Admin 0353205414 & Email thaytiensy@gmail.com.
 * - Xác thực Webhook SePay qua SEPAY_WEBHOOK_SECRET (fail-closed khi chưa cấu hình).
 * - Cơ chế Idempotency chống kích hoạt nâng cấp trùng đơn khi Webhook gửi lại nhiều lần.
 */

import crypto from "node:crypto";
import { BRANDING } from "@/config/branding";
import { DEFAULT_PLANS, getSupabaseAdmin, memoryStore } from "./db";
import type { PlanTier, PaymentOrder } from "@/types/database";

export interface VietQRBankConfig {
  configured: boolean;
  bankBin: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  template: string;
}

export interface VietQROrderResult {
  orderId: string;
  orderCode: string;
  workspaceId: string;
  planId: PlanTier;
  amountVnd: number;
  vietqrConfigured: boolean;
  qrImageUrl: string | null;
  bankInfo: {
    bankBin: string;
    bankName: string;
    accountNo: string;
    accountName: string;
    transferContent: string;
  } | null;
  activationNotice: string;
  contactSupport: {
    zalo: string;
    zaloUrl: string;
    email: string;
  };
}

export interface SePayWebhookPayload {
  id?: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  code?: string | null;
  content?: string;
  transferType?: string;
  transferAmount?: number;
  accumulated?: number;
  subAccount?: string | null;
  referenceCode?: string;
  description?: string;
}

/**
 * Đọc cấu hình VietQR 100% từ biến môi trường (không hardcode thông tin ngân hàng).
 */
export function getVietQRConfig(): VietQRBankConfig {
  const bankBin = (process.env.NEXT_PUBLIC_VIETQR_BANK_BIN || "").trim();
  const bankName = (process.env.NEXT_PUBLIC_VIETQR_BANK_NAME || "").trim();
  const accountNo = (process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || "").trim();
  const accountName = (process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || "").trim();
  const template = (
    process.env.NEXT_PUBLIC_VIETQR_TEMPLATE || BRANDING.payment.qrTemplate
  ).trim();

  const configured = Boolean(bankBin && bankName && accountNo && accountName);

  return {
    configured,
    bankBin,
    bankName,
    accountNo,
    accountName,
    template: template || "compact",
  };
}

/**
 * Sinh mã đơn hàng ngẫu nhiên chuẩn định dạng (ví dụ: NVAI739281)
 */
export function generateOrderCode(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${BRANDING.payment.prefixOrderCode}${randomNum}`;
}

/**
 * Tạo đơn thanh toán VietQR cho một Workspace
 */
export async function createVietQROrder(params: {
  workspaceId: string;
  planId: PlanTier;
  billingCycle?: "monthly" | "yearly";
}): Promise<VietQROrderResult> {
  const plan = DEFAULT_PLANS[params.planId];
  if (!plan) {
    throw new Error(`Gói cước không hợp lệ: ${params.planId}`);
  }

  let finalAmount = plan.price_vnd;

  // Nếu chọn thanh toán Năm: áp dụng mức giá năm ưu đãi giảm 20% theo bảng giá Đợt 1
  if (params.billingCycle === "yearly") {
    switch (params.planId) {
      case "starter_byok":
        finalAmount = 1890000;
        break;
      case "starter_credits":
        finalAmount = 3290000;
        break;
      case "pro_team_byok":
        finalAmount = 4790000;
        break;
      case "pro_team_credits":
        finalAmount = 7690000;
        break;
      case "business_byok":
        finalAmount = 11900000;
        break;
      case "business_credits":
        finalAmount = 18900000;
        break;
      default:
        finalAmount = Math.round(plan.price_vnd * 12 * 0.8);
    }
  }

  const orderCode = generateOrderCode();
  const vietqr = getVietQRConfig();

  const qrImageUrl = vietqr.configured
    ? `https://img.vietqr.io/image/${encodeURIComponent(vietqr.bankBin)}-${encodeURIComponent(vietqr.accountNo)}-${encodeURIComponent(vietqr.template)}.png?amount=${finalAmount}&addInfo=${encodeURIComponent(orderCode)}&accountName=${encodeURIComponent(vietqr.accountName)}`
    : null;

  const bankInfo = vietqr.configured
    ? {
        bankBin: vietqr.bankBin,
        bankName: vietqr.bankName,
        accountNo: vietqr.accountNo,
        accountName: vietqr.accountName,
        transferContent: orderCode,
      }
    : null;

  const activationNotice = vietqr.configured
    ? "Quét mã VietQR bằng ứng dụng ngân hàng để hệ thống tự động đối soát và kích hoạt."
    : `Cổng VietQR tự động chưa được cấu hình biến môi trường trên máy chủ. Vui lòng gửi mã đơn ${orderCode} qua Zalo Admin ${BRANDING.contact.zalo} (${BRANDING.contact.zaloUrl}) hoặc Email ${BRANDING.contact.email} để nhận mã QR kích hoạt chính thức.`;

  const contactSupport = {
    zalo: BRANDING.contact.zalo,
    zaloUrl: BRANDING.contact.zaloUrl,
    email: BRANDING.contact.email,
  };

  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from("payment_orders")
      .insert({
        workspace_id: params.workspaceId,
        order_code: orderCode,
        plan_id: params.planId,
        amount_vnd: finalAmount,
        status: "pending",
        payment_gateway: vietqr.configured ? "vietqr_sepay" : "assisted_admin",
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(
        `Lỗi khởi tạo đơn hàng: ${error?.message || "Không thể ghi nhận đơn hàng"}`
      );
    }

    return {
      orderId: data.id,
      orderCode,
      workspaceId: params.workspaceId,
      planId: params.planId,
      amountVnd: finalAmount,
      vietqrConfigured: vietqr.configured,
      qrImageUrl,
      bankInfo,
      activationNotice,
      contactSupport,
    };
  }

  // Fallback: In-memory store (an toàn khi chưa cấu hình Supabase trên Vercel)
  const orderId = `order-${Date.now()}`;
  const orderRecord: PaymentOrder = {
    id: orderId,
    workspace_id: params.workspaceId,
    order_code: orderCode,
    plan_id: params.planId,
    amount_vnd: finalAmount,
    status: "pending",
    payment_gateway: vietqr.configured ? "vietqr_sepay" : "assisted_admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryStore.paymentOrders.set(orderId, orderRecord);

  return {
    orderId,
    orderCode,
    workspaceId: params.workspaceId,
    planId: params.planId,
    amountVnd: finalAmount,
    vietqrConfigured: vietqr.configured,
    qrImageUrl,
    bankInfo,
    activationNotice,
    contactSupport,
  };
}

/**
 * Xác thực API Key Webhook của SePay qua biến môi trường SEPAY_WEBHOOK_SECRET.
 * Fail-closed: trả về false nếu SEPAY_WEBHOOK_SECRET chưa được thiết lập.
 */
export function verifySePayWebhookKey(authHeader: string | null): boolean {
  const secretKey = (process.env.SEPAY_WEBHOOK_SECRET || "").trim();
  if (!secretKey) {
    return false;
  }

  if (!authHeader) return false;
  // Header chuẩn SePay: 'Apikey <secret>' hoặc '<secret>'
  const token = authHeader.replace(/^Apikey\s+/i, "").trim();
  if (!token) return false;

  const expectedBuf = Buffer.from(secretKey, "utf8");
  const actualBuf = Buffer.from(token, "utf8");
  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Xử lý Webhook SePay với cơ chế chống trùng đơn (IDEMPOTENCY) & Tự động Nâng cấp Gói
 */
export async function processSePayWebhookPayment(
  payload: SePayWebhookPayload
): Promise<{
  success: boolean;
  message: string;
  isIdempotent?: boolean;
  orderCode?: string;
  upgradedTier?: PlanTier;
}> {
  // Bỏ qua giao dịch tiền ra (chỉ kích hoạt đơn với tiền vào)
  if (payload.transferType && payload.transferType.toLowerCase() !== "in") {
    return {
      success: true,
      isIdempotent: true,
      message: "Bỏ qua giao dịch tiền ra (transferType != in).",
    };
  }

  // Tìm mã đơn hàng NVAIxxxxxx trong nội dung chuyển khoản
  const rawContent = (payload.content || payload.description || "").toUpperCase();
  const match = rawContent.match(/NVAI\d{6}/);

  if (!match) {
    return {
      success: false,
      message: "Không tìm thấy mã đơn hợp lệ (NVAIxxxxxx) trong nội dung giao dịch.",
    };
  }

  const orderCode = match[0];
  const transferAmount = Number(payload.transferAmount || 0);
  const transactionRef = String(
    payload.referenceCode || payload.id || `TX-${Date.now()}`
  );

  const supabase = getSupabaseAdmin();

  if (supabase) {
    // 1. Tìm đơn hàng
    const { data: order, error: orderErr } = await supabase
      .from("payment_orders")
      .select("*")
      .eq("order_code", orderCode)
      .single();

    if (orderErr || !order) {
      return {
        success: false,
        message: `Đơn hàng ${orderCode} không tồn tại trong hệ thống.`,
        orderCode,
      };
    }

    // 2. CHỐT CHẶN IDEMPOTENCY: Nếu đơn đã được kích hoạt thanh toán trước đó
    if (order.status === "paid") {
      return {
        success: true,
        message: `Đơn hàng ${orderCode} đã được xử lý trước đó (Idempotent: Bỏ qua kích hoạt trùng lặp).`,
        isIdempotent: true,
        orderCode,
        upgradedTier: order.plan_id,
      };
    }

    // 3. Kiểm tra số tiền nhận được
    if (transferAmount < order.amount_vnd) {
      return {
        success: false,
        message: `Số tiền chuyển (${transferAmount}đ) không đủ so với giá trị đơn hàng (${order.amount_vnd}đ). Vui lòng liên hệ Zalo ${BRANDING.contact.zalo} để xử lý.`,
        orderCode,
      };
    }

    const now = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 4. Cập nhật đơn hàng thành 'paid' với khóa nguyên tử chống race condition
    const { data: updatedRows, error: updateErr } = await supabase
      .from("payment_orders")
      .update({
        status: "paid",
        transaction_ref: transactionRef,
        raw_webhook_payload: payload,
        paid_at: now,
        updated_at: now,
      })
      .eq("id", order.id)
      .eq("status", "pending")
      .select("id");

    if (updateErr) {
      throw new Error(`Lỗi cập nhật đơn thanh toán: ${updateErr.message}`);
    }

    if (!updatedRows || updatedRows.length === 0) {
      return {
        success: true,
        message: `Đơn hàng ${orderCode} đã được xử lý đồng thời trước đó (Idempotent).`,
        isIdempotent: true,
        orderCode,
        upgradedTier: order.plan_id,
      };
    }
    // 5. Nâng cấp tier của Workspace
    await supabase
      .from("workspaces")
      .update({
        tier: order.plan_id,
        updated_at: now,
      })
      .eq("id", order.workspace_id);

    // 6. Ghi nhận gói đăng ký (Subscription)
    await supabase.from("subscriptions").insert({
      workspace_id: order.workspace_id,
      plan_id: order.plan_id,
      status: "active",
      current_period_start: now,
      current_period_end: periodEnd,
      auto_renew: true,
    });

    // 7. Cấp AI Credits nếu là gói All-in-One
    const plan = DEFAULT_PLANS[order.plan_id as PlanTier];
    if (plan && plan.ai_credit_monthly > 0) {
      const { data: existingCredits } = await supabase
        .from("usage_credits")
        .select("*")
        .eq("workspace_id", order.workspace_id)
        .single();

      if (existingCredits) {
        await supabase
          .from("usage_credits")
          .update({
            monthly_allowance: plan.ai_credit_monthly,
            balance_remaining:
              existingCredits.balance_remaining + plan.ai_credit_monthly,
            last_refill_at: now,
            updated_at: now,
          })
          .eq("workspace_id", order.workspace_id);
      } else {
        await supabase.from("usage_credits").insert({
          workspace_id: order.workspace_id,
          monthly_allowance: plan.ai_credit_monthly,
          balance_remaining: plan.ai_credit_monthly,
          total_consumed_lifetime: 0,
          last_refill_at: now,
        });
      }
    }

    return {
      success: true,
      message: `Đơn hàng ${orderCode} thanh toán thành công! Workspace đã được nâng cấp lên gói ${order.plan_id}.`,
      orderCode,
      upgradedTier: order.plan_id,
    };
  }

  // Fallback: In-memory store
  let foundOrder: PaymentOrder | null = null;
  for (const ord of memoryStore.paymentOrders.values()) {
    if (ord.order_code === orderCode) {
      foundOrder = ord;
      break;
    }
  }

  if (!foundOrder) {
    return {
      success: false,
      message: `Đơn hàng ${orderCode} không tồn tại trong bộ nhớ.`,
      orderCode,
    };
  }

  if (foundOrder.status === "paid") {
    return {
      success: true,
      message: `Đơn hàng ${orderCode} đã xử lý xong trước đó (Idempotent).`,
      isIdempotent: true,
      orderCode,
      upgradedTier: foundOrder.plan_id,
    };
  }

  if (transferAmount < foundOrder.amount_vnd) {
    return {
      success: false,
      message: `Số tiền chuyển (${transferAmount}đ) không đủ so với giá trị đơn hàng (${foundOrder.amount_vnd}đ). Vui lòng liên hệ Zalo ${BRANDING.contact.zalo} để xử lý.`,
      orderCode,
    };
  }

  foundOrder.status = "paid";
  foundOrder.transaction_ref = transactionRef;
  foundOrder.raw_webhook_payload = payload as Record<string, unknown>;
  foundOrder.paid_at = new Date().toISOString();

  // Nâng cấp workspace
  const ws = memoryStore.workspaces.get(foundOrder.workspace_id);
  if (ws) {
    ws.tier = foundOrder.plan_id;
  }

  return {
    success: true,
    message: `Đơn hàng ${orderCode} thanh toán thành công trong bộ nhớ! Gói kích hoạt: ${foundOrder.plan_id}.`,
    orderCode,
    upgradedTier: foundOrder.plan_id,
  };
}
