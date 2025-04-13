var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-YOfpmy/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// api/domains/status.ts
var onRequestPost = /* @__PURE__ */ __name(async (context) => {
  try {
    const { domain, status } = await context.request.json();
    const result = await context.env.DB.prepare(`
            UPDATE domains 
            SET status = ? 
            WHERE domain = ?
            RETURNING *
        `).bind(
      status,
      domain
    ).run();
    if (!result.success) {
      throw new Error("\u66F4\u65B0\u72B6\u6001\u5931\u8D25");
    }
    return Response.json({
      status: 200,
      message: "\u66F4\u65B0\u6210\u529F",
      data: result.results?.[0] || null
    });
  } catch (error) {
    console.error("\u66F4\u65B0\u57DF\u540D\u72B6\u6001\u5931\u8D25:", error);
    return Response.json({
      status: 500,
      message: error instanceof Error ? error.message : "\u66F4\u65B0\u57DF\u540D\u72B6\u6001\u5931\u8D25",
      data: null
    }, { status: 500 });
  }
}, "onRequestPost");

// api/domains/[id].ts
var onRequestPut = /* @__PURE__ */ __name(async (context) => {
  try {
    const id = context.params.id;
    const data = await context.request.json();
    const requiredFields = ["domain", "registrar", "registrar_date", "expiry_date", "service_type", "status"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return Response.json({
          status: 400,
          message: `${field} \u662F\u5FC5\u586B\u5B57\u6BB5`,
          data: null
        }, { status: 400 });
      }
    }
    const result = await context.env.DB.prepare(`
            UPDATE domains SET
                domain = ?,
                registrar = ?,
                registrar_link = ?,
                registrar_date = ?,
                expiry_date = ?,
                service_type = ?,
                status = ?,
                tgsend = ?,
                memo = ?
            WHERE id = ?
            RETURNING *
        `).bind(
      data.domain,
      data.registrar,
      data.registrar_link || "",
      data.registrar_date,
      data.expiry_date,
      data.service_type,
      data.status,
      data.tgsend || 0,
      data.memo || "",
      id
    ).run();
    if (result.success) {
      const updatedDomain = result.results?.[0] || null;
      if (!updatedDomain) {
        return Response.json({
          status: 404,
          message: "\u57DF\u540D\u4E0D\u5B58\u5728",
          data: null
        }, { status: 404 });
      }
      return Response.json({
        status: 200,
        message: "\u66F4\u65B0\u6210\u529F",
        data: updatedDomain
      });
    } else {
      throw new Error("\u6570\u636E\u5E93\u66F4\u65B0\u5931\u8D25");
    }
  } catch (error) {
    console.error("\u66F4\u65B0\u57DF\u540D\u5931\u8D25:", error);
    return Response.json({
      status: 500,
      message: error instanceof Error ? error.message : "\u66F4\u65B0\u57DF\u540D\u5931\u8D25",
      data: null
    }, { status: 500 });
  }
}, "onRequestPut");
var onRequestDelete = /* @__PURE__ */ __name(async (context) => {
  try {
    const id = context.params.id;
    const result = await context.env.DB.prepare(
      "DELETE FROM domains WHERE id = ?"
    ).bind(id).run();
    if (result.success) {
      return Response.json({
        status: 200,
        message: "\u5220\u9664\u6210\u529F",
        data: null
      });
    } else {
      throw new Error("\u5220\u9664\u5931\u8D25");
    }
  } catch (error) {
    return Response.json({
      status: 500,
      message: error instanceof Error ? error.message : "\u5220\u9664\u57DF\u540D\u5931\u8D25",
      data: null
    }, { status: 500 });
  }
}, "onRequestDelete");

// api/addrec/index.ts
var onRequestPost2 = /* @__PURE__ */ __name(async (context) => {
  try {
    const url = new URL(context.request.url);
    const tokenParam = url.searchParams.get("token");
    const authHeader = context.request.headers.get("Authorization");
    const headerToken = authHeader?.replace("Bearer ", "");
    const token = tokenParam || headerToken;
    if (!token || token !== context.env.API_TOKEN) {
      return Response.json({
        status: 401,
        message: "\u672A\u6388\u6743\u8BBF\u95EE",
        data: null
      }, { status: 401 });
    }
    const data = await context.request.json();
    console.log("\u63A5\u6536\u5230\u7684\u6570\u636E:", data);
    const requiredFields = ["domain", "registrar", "registrar_date", "expiry_date", "service_type", "status"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return Response.json({
          status: 400,
          message: `${field} \u662F\u5FC5\u586B\u5B57\u6BB5`,
          data: null
        }, { status: 400 });
      }
    }
    const domainRegex = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
    if (!domainRegex.test(data.domain)) {
      return Response.json({
        status: 400,
        message: "\u57DF\u540D\u683C\u5F0F\u4E0D\u6B63\u786E",
        data: null
      }, { status: 400 });
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.registrar_date) || !dateRegex.test(data.expiry_date)) {
      return Response.json({
        status: 400,
        message: "\u65E5\u671F\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u5E94\u4E3A YYYY-MM-DD",
        data: null
      }, { status: 400 });
    }
    const { results: existingDomains } = await context.env.DB.prepare(
      "SELECT id FROM domains WHERE domain = ?"
    ).bind(data.domain).all();
    if (existingDomains.length > 0) {
      const result2 = await context.env.DB.prepare(`
                UPDATE domains 
                SET service_type = ?, status = ?
                WHERE domain = ?
                RETURNING *
            `).bind(
        data.service_type,
        data.status,
        data.domain
      ).run();
      if (result2.success) {
        const updatedDomain = result2.results?.[0] || null;
        console.log("\u66F4\u65B0\u6210\u529F:", updatedDomain);
        return Response.json({
          status: 200,
          message: "\u66F4\u65B0\u6210\u529F",
          data: updatedDomain
        });
      } else {
        throw new Error("\u6570\u636E\u5E93\u66F4\u65B0\u5931\u8D25");
      }
    }
    const result = await context.env.DB.prepare(`
            INSERT INTO domains (
                domain, registrar, registrar_link, registrar_date,
                expiry_date, service_type, status, tgsend, memo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        `).bind(
      data.domain,
      data.registrar,
      data.registrar_link || "",
      data.registrar_date,
      data.expiry_date,
      data.service_type,
      data.status,
      data.tgsend || 0,
      data.memo || ""
    ).run();
    if (result.success) {
      const newDomain = result.results?.[0] || null;
      console.log("\u521B\u5EFA\u6210\u529F:", newDomain);
      return Response.json({
        status: 200,
        message: "\u521B\u5EFA\u6210\u529F",
        data: newDomain
      });
    } else {
      throw new Error("\u6570\u636E\u5E93\u63D2\u5165\u5931\u8D25");
    }
  } catch (error) {
    console.error("\u521B\u5EFA\u57DF\u540D\u5931\u8D25:", error);
    return Response.json({
      status: 500,
      message: error instanceof Error ? error.message : "\u521B\u5EFA\u57DF\u540D\u5931\u8D25",
      data: null
    }, { status: 500 });
  }
}, "onRequestPost");

// api/alertconfig/index.ts
var onRequestGet = /* @__PURE__ */ __name(async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM alertcfg LIMIT 1"
    ).all();
    return Response.json({
      status: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: results[0] || null
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u914D\u7F6E\u5931\u8D25:", error);
    return Response.json({
      status: 500,
      message: "\u83B7\u53D6\u914D\u7F6E\u5931\u8D25",
      data: null
    }, { status: 500 });
  }
}, "onRequestGet");
var onRequestPost3 = /* @__PURE__ */ __name(async (context) => {
  try {
    const data = await context.request.json();
    const requiredFields = ["tg_token", "tg_userid", "days"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return Response.json({
          status: 400,
          message: `${field} \u662F\u5FC5\u586B\u5B57\u6BB5`,
          data: null
        }, { status: 400 });
      }
    }
    const { results } = await context.env.DB.prepare(
      "SELECT id FROM alertcfg LIMIT 1"
    ).all();
    let result;
    if (results.length > 0) {
      result = await context.env.DB.prepare(`
                UPDATE alertcfg 
                SET tg_token = ?, tg_userid = ?, days = ?
                WHERE id = ?
                RETURNING *
            `).bind(
        data.tg_token,
        data.tg_userid,
        data.days,
        results[0].id
      ).run();
    } else {
      result = await context.env.DB.prepare(`
                INSERT INTO alertcfg (tg_token, tg_userid, days)
                VALUES (?, ?, ?)
                RETURNING *
            `).bind(
        data.tg_token,
        data.tg_userid,
        data.days
      ).run();
    }
    if (result.success) {
      const config = result.results?.[0] || null;
      return Response.json({
        status: 200,
        message: results.length > 0 ? "\u66F4\u65B0\u6210\u529F" : "\u4FDD\u5B58\u6210\u529F",
        data: config
      });
    } else {
      throw new Error("\u6570\u636E\u5E93\u64CD\u4F5C\u5931\u8D25");
    }
  } catch (error) {
    console.error("\u4FDD\u5B58\u914D\u7F6E\u5931\u8D25:", error);
    return Response.json({
      status: 500,
      message: error instanceof Error ? error.message : "\u4FDD\u5B58\u914D\u7F6E\u5931\u8D25",
      data: null
    }, { status: 500 });
  }
}, "onRequestPost");

// api/check/index.ts
var onRequestPost4 = /* @__PURE__ */ __name(async (context) => {
  try {
    const url = new URL(context.request.url);
    const tokenParam = url.searchParams.get("token");
    const authHeader = context.request.headers.get("Authorization");
    const headerToken = authHeader?.replace("Bearer ", "");
    const token = tokenParam || headerToken;
    if (!token || token !== context.env.API_TOKEN) {
      return Response.json({
        status: 401,
        message: "\u672A\u6388\u6743\u8BBF\u95EE",
        data: null
      }, { status: 401 });
    }
    console.log("\u5F00\u59CB\u6267\u884C\u57DF\u540D\u68C0\u67E5...");
    const { results: configResults } = await context.env.DB.prepare(
      "SELECT * FROM alertcfg LIMIT 1"
    ).all();
    if (!configResults.length) {
      console.log("\u672A\u627E\u5230\u544A\u8B66\u914D\u7F6E");
      return Response.json({
        status: 404,
        message: "\u672A\u627E\u5230\u544A\u8B66\u914D\u7F6E",
        data: null
      }, { status: 404 });
    }
    const config = configResults[0];
    console.log("\u83B7\u53D6\u5230\u544A\u8B66\u914D\u7F6E:", {
      days: config.days,
      has_token: !!config.tg_token,
      has_userid: !!config.tg_userid
    });
    const { results: domains } = await context.env.DB.prepare(
      "SELECT domain, expiry_date, tgsend FROM domains WHERE tgsend = 1"
    ).all();
    console.log(`\u627E\u5230 ${domains.length} \u4E2A\u542F\u7528\u901A\u77E5\u7684\u57DF\u540D`);
    const notifiedDomains = [];
    for (const domain of domains) {
      const remainingDays = calculateRemainingDays(domain.expiry_date);
      console.log(`\u68C0\u67E5\u57DF\u540D ${domain.domain}: \u8FC7\u671F\u65F6\u95F4 ${domain.expiry_date}, \u5269\u4F59\u5929\u6570 ${remainingDays}`);
      if (remainingDays <= config.days) {
        console.log(`\u57DF\u540D ${domain.domain} \u9700\u8981\u53D1\u9001\u901A\u77E5\uFF1A\u5269\u4F59\u5929\u6570(${remainingDays}) <= \u9608\u503C(${config.days})`);
        const message = `*\u{1F514} Domains-Support\u901A\u77E5*

\u{1F310} \u57DF\u540D\uFF1A\`${domain.domain}\`
\u{1F4C5} \u8FC7\u671F\u65F6\u95F4\uFF1A\`${domain.expiry_date}\`
\u23F3 \u5269\u4F59\u5929\u6570\uFF1A\`${remainingDays}\u5929\`

\u26A0\uFE0F \u5269\u4F59\u5929\u6570\u544A\u8B66\uFF0C\u8BF7\u5C3D\u5FEB\u8FDB\u884C\u7EED\u7EA6\uFF01`;
        try {
          console.log("\u51C6\u5907\u53D1\u9001 Telegram \u6D88\u606F...");
          await sendTelegramMessage(config.tg_token, config.tg_userid, message);
          console.log(`\u6210\u529F\u53D1\u9001 Telegram \u901A\u77E5\uFF1A${domain.domain}`);
          notifiedDomains.push({
            domain: domain.domain,
            remainingDays,
            expiry_date: domain.expiry_date
          });
        } catch (error) {
          console.error(`\u53D1\u9001 Telegram \u6D88\u606F\u5931\u8D25:`, error);
          throw error;
        }
      }
    }
    return Response.json({
      status: 200,
      message: "\u68C0\u67E5\u5B8C\u6210",
      data: {
        total_domains: domains.length,
        notified_domains: notifiedDomains
      }
    });
  } catch (error) {
    console.error("\u68C0\u67E5\u6267\u884C\u5931\u8D25:", error);
    return Response.json({
      status: 500,
      message: "\u68C0\u67E5\u6267\u884C\u5931\u8D25: " + error.message,
      data: null
    }, { status: 500 });
  }
}, "onRequestPost");
var onRequestGet2 = onRequestPost4;
function calculateRemainingDays(expiryDate) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
__name(calculateRemainingDays, "calculateRemainingDays");
async function sendTelegramMessage(token, chatId, message) {
  if (!token || !chatId) {
    throw new Error("Telegram token \u6216 chat ID \u672A\u914D\u7F6E");
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  console.log("\u53D1\u9001 Telegram \u8BF7\u6C42:", { url, chatId, messageLength: message.length });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    })
  });
  const responseData = await response.json();
  if (!response.ok) {
    console.error("Telegram API \u54CD\u5E94\u9519\u8BEF:", responseData);
    throw new Error(`Failed to send Telegram message: ${response.statusText}, Details: ${JSON.stringify(responseData)}`);
  }
  console.log("Telegram API \u54CD\u5E94:", responseData);
}
__name(sendTelegramMessage, "sendTelegramMessage");

// api/domains/index.ts
var onRequestGet3 = /* @__PURE__ */ __name(async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM domains ORDER BY created_at DESC"
    ).all();
    return Response.json({
      status: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: results
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u57DF\u540D\u5217\u8868\u5931\u8D25:", error);
    return Response.json({
      status: 500,
      message: "\u83B7\u53D6\u57DF\u540D\u5217\u8868\u5931\u8D25",
      data: null
    }, { status: 500 });
  }
}, "onRequestGet");
var onRequestPost5 = /* @__PURE__ */ __name(async (context) => {
  try {
    const data = await context.request.json();
    console.log("\u63A5\u6536\u5230\u7684\u6570\u636E:", data);
    const requiredFields = ["domain", "registrar", "registrar_date", "expiry_date", "service_type", "status"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return Response.json({
          status: 400,
          message: `${field} \u662F\u5FC5\u586B\u5B57\u6BB5`,
          data: null
        }, { status: 400 });
      }
    }
    const result = await context.env.DB.prepare(`
            INSERT INTO domains (
                domain, registrar, registrar_link, registrar_date,
                expiry_date, service_type, status, tgsend, memo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        `).bind(
      data.domain,
      data.registrar,
      data.registrar_link || "",
      data.registrar_date,
      data.expiry_date,
      data.service_type,
      data.status,
      data.tgsend || 0,
      data.memo || ""
    ).run();
    if (result.success) {
      const newDomain = result.results?.[0] || null;
      console.log("\u521B\u5EFA\u6210\u529F:", newDomain);
      return Response.json({
        status: 200,
        message: "\u521B\u5EFA\u6210\u529F",
        data: newDomain
      });
    } else {
      throw new Error("\u6570\u636E\u5E93\u63D2\u5165\u5931\u8D25");
    }
  } catch (error) {
    console.error("\u521B\u5EFA\u57DF\u540D\u5931\u8D25:", error);
    return Response.json({
      status: 500,
      message: error instanceof Error ? error.message : "\u521B\u5EFA\u57DF\u540D\u5931\u8D25",
      data: null
    }, { status: 500 });
  }
}, "onRequestPost");

// api/login.ts
var onRequestPost6 = /* @__PURE__ */ __name(async (context) => {
  try {
    const { username, password } = await context.request.json();
    const expectedUsername = context.env.VITE_USER;
    const expectedPassword = context.env.VITE_PASS;
    console.log("\u73AF\u5883\u53D8\u91CF:", {
      VITE_USER: expectedUsername,
      VITE_PASS: expectedPassword
    });
    console.log("\u767B\u5F55\u5C1D\u8BD5:", {
      providedUsername: username,
      providedPassword: password,
      usernameMatch: username === expectedUsername,
      passwordMatch: password === expectedPassword
    });
    if (!expectedUsername || !expectedPassword) {
      console.error("\u73AF\u5883\u53D8\u91CF\u672A\u8BBE\u7F6E:", {
        hasUsername: !!expectedUsername,
        hasPassword: !!expectedPassword
      });
      return Response.json({
        status: 500,
        message: "\u7CFB\u7EDF\u914D\u7F6E\u9519\u8BEF\uFF1A\u672A\u8BBE\u7F6E\u7528\u6237\u540D\u6216\u5BC6\u7801",
        data: null
      }, { status: 500 });
    }
    if (username === expectedUsername && password === expectedPassword) {
      const token = btoa(JSON.stringify({
        username,
        timestamp: (/* @__PURE__ */ new Date()).getTime()
      }));
      return Response.json({
        status: 200,
        message: "\u767B\u5F55\u6210\u529F",
        data: { token }
      });
    } else {
      return Response.json({
        status: 401,
        message: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF",
        data: null
      }, { status: 401 });
    }
  } catch (error) {
    console.error("\u767B\u5F55\u9519\u8BEF:", error);
    return Response.json({
      status: 500,
      message: error instanceof Error ? error.message : "\u767B\u5F55\u5931\u8D25",
      data: null
    }, { status: 500 });
  }
}, "onRequestPost");

// [[path]].ts
var onRequest = /* @__PURE__ */ __name(async (context) => {
  try {
    return await context.next();
  } catch (err) {
    const error = err;
    return new Response(`${error.message || "\u672A\u77E5\u9519\u8BEF"}`, { status: 500 });
  }
}, "onRequest");

// ../.wrangler/tmp/pages-xhMrK6/functionsRoutes-0.024872748194473493.mjs
var routes = [
  {
    routePath: "/api/domains/status",
    mountPath: "/api/domains",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/domains/:id",
    mountPath: "/api/domains",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/domains/:id",
    mountPath: "/api/domains",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/addrec",
    mountPath: "/api/addrec",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/alertconfig",
    mountPath: "/api/alertconfig",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/alertconfig",
    mountPath: "/api/alertconfig",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/check",
    mountPath: "/api/check",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/check",
    mountPath: "/api/check",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/domains",
    mountPath: "/api/domains",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/domains",
    mountPath: "/api/domains",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/login",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/:path*",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest]
  }
];

// C:/Users/frnakie/AppData/Roaming/npm/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// C:/Users/frnakie/AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// C:/Users/frnakie/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/frnakie/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-YOfpmy/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// C:/Users/frnakie/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-YOfpmy/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.45078113172763223.mjs.map
