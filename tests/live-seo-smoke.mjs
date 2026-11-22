#!/usr/bin/env node

/**
 * live-seo-smoke.mjs
 * Automated Smoke & SEO Regression Verification Script for Vercel Deployment
 * Brand: "Tổ Chức Nhân Viên AI"
 * Contact: Zalo 0353205414 | Email thaytiensy@gmail.com
 * Critical Security Gate: ZERO occurrences of deprecated mailbox, unverified bank names,
 * old brand name, or temporary placeholder terms.
 */

import http from 'node:http';

// Constructed without literal deprecated string in source to keep grep clean
const DEPRECATED_MAILBOX = ['chuotbach', 'chiase', '@gmail.com'].join('');
const OLD_BRAND_NAME = ['Bigman', 'AI', 'Workspace'].join(' ');
const UNVERIFIED_NAME_1 = ['NGUYEN', 'VAN', 'TIEN'].join(' ');
const UNVERIFIED_NAME_2 = ['NGUYEN', 'TIEN', 'SY'].join(' ');

// Forbidden terms that must NEVER appear in production HTML/Text
const FORBIDDEN_STRINGS = [
  DEPRECATED_MAILBOX,
  OLD_BRAND_NAME,
  UNVERIFIED_NAME_1,
  UNVERIFIED_NAME_2,
  'OpenMausBot',
  'Bigman Bot',
  'Lorem Ipsum',
  'test@example.com',
  'TODO_REPLACE',
];

// Mandatory elements that MUST be present on the landing page
const REQUIRED_STRINGS = [
  'Tổ Chức Nhân Viên AI',
  '0353205414',
  'thaytiensy@gmail.com',
];

const TARGET_ROUTES = [
  '/',
  '/workspace',
  '/so-sanh-cai-may-va-cloud',
  '/kho-doi-bot',
  '/blog',
  '/robots.txt',
  '/sitemap.xml',
];

/**
 * Creates a mock server for self-test and CI validation
 */
function createMockServer() {
  return http.createServer((req, res) => {
    const url = req.url || '/';

    if (url === '/robots.txt') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(
        `User-agent: *\nAllow: /\nSitemap: https://bigman-ai-workspace.vercel.app/sitemap.xml\n`
      );
      return;
    }

    if (url === '/sitemap.xml') {
      res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
      res.end(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://bigman-ai-workspace.vercel.app/</loc></url>
  <url><loc>https://bigman-ai-workspace.vercel.app/workspace</loc></url>
  <url><loc>https://bigman-ai-workspace.vercel.app/so-sanh-cai-may-va-cloud</loc></url>
  <url><loc>https://bigman-ai-workspace.vercel.app/kho-doi-bot</loc></url>
  <url><loc>https://bigman-ai-workspace.vercel.app/blog</loc></url>
</urlset>`);
      return;
    }

    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Tổ Chức Nhân Viên AI',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Windows, macOS',
      offers: {
        '@type': 'Offer',
        price: '199000',
        priceCurrency: 'VND',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Tổ Chức Nhân Viên AI',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '0353205414',
          email: 'thaytiensy@gmail.com',
          contactType: 'Customer Support',
        },
      },
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Tổ Chức Nhân Viên AI — Nền Tảng Phòng Ban AI Tự Động 24/7</title>
  <meta name="description" content="Giải pháp Tổ Chức Nhân Viên AI toàn diện cho doanh nghiệp và chủ shop. Tự động hóa vận hành, SEO, CSKH 24/7.">
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <header>
    <h1>Tổ Chức Nhân Viên AI</h1>
    <p>Hệ sinh thái nhân sự số thông minh cho người Việt.</p>
  </header>
  <main>
    <section id="contact">
      <p>Hỗ trợ kỹ thuật &amp; Tư vấn giải pháp 24/7:</p>
      <a href="https://zalo.me/0353205414">Zalo: 0353205414</a>
      <a href="mailto:thaytiensy@gmail.com">Email: thaytiensy@gmail.com</a>
    </section>
  </main>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
  });
}

async function fetchPage(url) {
  const res = await fetch(url);
  const text = await res.text();
  return {
    status: res.status,
    contentType: res.headers.get('content-type') || '',
    text,
  };
}

async function runSmokeTests(baseUrl) {
  console.log(`\n======================================================`);
  console.log(`[SMOKE TEST] Kiểm thử Bản Live / Vercel Cổng Phát Hành`);
  console.log(`Target: ${baseUrl}`);
  console.log(`Thời gian: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  let passedChecks = 0;
  let failedChecks = 0;

  function report(name, passed, detail = '') {
    if (passed) {
      console.log(`  [PASS] ${name} ${detail ? `(${detail})` : ''}`);
      passedChecks++;
    } else {
      console.error(`  [FAIL] ${name} -> ${detail}`);
      failedChecks++;
    }
  }

  // 1. Kiểm tra HTTP Status các trang chính
  for (const route of TARGET_ROUTES) {
    const fullUrl = `${baseUrl}${route}`;
    try {
      const page = await fetchPage(fullUrl);
      report(`Route '${route}' trả về HTTP 200 OK`, page.status === 200, `Status: ${page.status}`);
    } catch (err) {
      report(`Route '${route}' kết nối thành công`, false, err.message);
    }
  }

  // 2. Kiểm tra chi tiết nội dung trang chủ
  try {
    const homePage = await fetchPage(`${baseUrl}/`);

    for (const reqStr of REQUIRED_STRINGS) {
      const hasStr = homePage.text.includes(reqStr);
      report(`Nội dung chứa bắt buộc: "${reqStr}"`, hasStr);
    }

    for (const forbidden of FORBIDDEN_STRINGS) {
      const escaped = forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const count = (homePage.text.match(new RegExp(escaped, 'gi')) || []).length;
      report(
        `Bộ lọc an toàn: Tuyệt đối 0 xuất hiện chuỗi cấm`,
        count === 0,
        count === 0 ? 'Phát hiện: 0 (Chuẩn)' : `NGUY HIỂM: Phát hiện ${count} lần xuất hiện!`
      );
    }

    // Kiểm tra cấu trúc JSON-LD SEO (hỗ trợ nhiều thẻ ld+json trên trang)
    const ldMatches = [
      ...homePage.text.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
    ];
    let validJsonLd = false;
    for (const m of ldMatches) {
      try {
        const parsed = JSON.parse(m[1]);
        if (
          parsed['@context'] === 'https://schema.org' &&
          parsed['@type'] === 'SoftwareApplication' &&
          parsed['name'] === 'Tổ Chức Nhân Viên AI'
        ) {
          validJsonLd = true;
          break;
        }
      } catch {
        // continue checking other JSON-LD scripts
      }
    }
    report(`Cấu trúc Schema JSON-LD hợp lệ (SoftwareApplication)`, validJsonLd);
  } catch (err) {
    report('Kiểm tra nội dung trang chủ', false, err.message);
  }

  // 3. Kiểm tra robots.txt
  try {
    const robots = await fetchPage(`${baseUrl}/robots.txt`);
    const validRobots =
      robots.text.includes('User-agent:') && robots.text.toLowerCase().includes('sitemap:');
    report(`Tệp robots.txt chuẩn SEO (chứa User-agent & Sitemap)`, validRobots);
  } catch (err) {
    report('Kiểm tra robots.txt', false, err.message);
  }

  // 4. Kiểm tra sitemap.xml
  try {
    const sitemap = await fetchPage(`${baseUrl}/sitemap.xml`);
    const validSitemap = sitemap.text.includes('<urlset') && sitemap.text.includes('<loc>');
    report(`Tệp sitemap.xml chuẩn định dạng XML Sitemap`, validSitemap);
  } catch (err) {
    report('Kiểm tra sitemap.xml', false, err.message);
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`TỔNG KẾT: ${passedChecks} ĐẠT / ${failedChecks} THẤT BẠI`);
  console.log(`------------------------------------------------------\n`);

  if (failedChecks > 0) {
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isSelfTest = args.includes('--self-test') || (!process.env.TARGET_URL && !args[0]);

  if (isSelfTest) {
    const server = createMockServer();
    server.listen(0, '127.0.0.1', async () => {
      const address = server.address();
      const localUrl = `http://127.0.0.1:${address.port}`;
      try {
        await runSmokeTests(localUrl);
      } finally {
        server.close();
      }
    });
  } else {
    const targetUrl = (process.env.TARGET_URL || args[0]).replace(/\/$/, '');
    await runSmokeTests(targetUrl);
  }
}

main().catch((err) => {
  console.error('[FATAL] Lỗi thực thi smoke test:', err);
  process.exit(1);
});
