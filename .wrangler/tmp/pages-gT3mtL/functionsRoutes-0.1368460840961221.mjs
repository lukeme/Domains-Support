import { onRequestPost as __api_domains_status_ts_onRequestPost } from "D:\\git\\domains-support\\functions\\api\\domains\\status.ts"
import { onRequestDelete as __api_domains__id__ts_onRequestDelete } from "D:\\git\\domains-support\\functions\\api\\domains\\[id].ts"
import { onRequestPut as __api_domains__id__ts_onRequestPut } from "D:\\git\\domains-support\\functions\\api\\domains\\[id].ts"
import { onRequestPost as __api_addrec_index_ts_onRequestPost } from "D:\\git\\domains-support\\functions\\api\\addrec\\index.ts"
import { onRequestGet as __api_alertconfig_index_ts_onRequestGet } from "D:\\git\\domains-support\\functions\\api\\alertconfig\\index.ts"
import { onRequestPost as __api_alertconfig_index_ts_onRequestPost } from "D:\\git\\domains-support\\functions\\api\\alertconfig\\index.ts"
import { onRequestGet as __api_check_index_ts_onRequestGet } from "D:\\git\\domains-support\\functions\\api\\check\\index.ts"
import { onRequestPost as __api_check_index_ts_onRequestPost } from "D:\\git\\domains-support\\functions\\api\\check\\index.ts"
import { onRequestGet as __api_domains_index_ts_onRequestGet } from "D:\\git\\domains-support\\functions\\api\\domains\\index.ts"
import { onRequestPost as __api_domains_index_ts_onRequestPost } from "D:\\git\\domains-support\\functions\\api\\domains\\index.ts"
import { onRequestPost as __api_login_ts_onRequestPost } from "D:\\git\\domains-support\\functions\\api\\login.ts"
import { onRequest as ____path___ts_onRequest } from "D:\\git\\domains-support\\functions\\[[path]].ts"

export const routes = [
    {
      routePath: "/api/domains/status",
      mountPath: "/api/domains",
      method: "POST",
      middlewares: [],
      modules: [__api_domains_status_ts_onRequestPost],
    },
  {
      routePath: "/api/domains/:id",
      mountPath: "/api/domains",
      method: "DELETE",
      middlewares: [],
      modules: [__api_domains__id__ts_onRequestDelete],
    },
  {
      routePath: "/api/domains/:id",
      mountPath: "/api/domains",
      method: "PUT",
      middlewares: [],
      modules: [__api_domains__id__ts_onRequestPut],
    },
  {
      routePath: "/api/addrec",
      mountPath: "/api/addrec",
      method: "POST",
      middlewares: [],
      modules: [__api_addrec_index_ts_onRequestPost],
    },
  {
      routePath: "/api/alertconfig",
      mountPath: "/api/alertconfig",
      method: "GET",
      middlewares: [],
      modules: [__api_alertconfig_index_ts_onRequestGet],
    },
  {
      routePath: "/api/alertconfig",
      mountPath: "/api/alertconfig",
      method: "POST",
      middlewares: [],
      modules: [__api_alertconfig_index_ts_onRequestPost],
    },
  {
      routePath: "/api/check",
      mountPath: "/api/check",
      method: "GET",
      middlewares: [],
      modules: [__api_check_index_ts_onRequestGet],
    },
  {
      routePath: "/api/check",
      mountPath: "/api/check",
      method: "POST",
      middlewares: [],
      modules: [__api_check_index_ts_onRequestPost],
    },
  {
      routePath: "/api/domains",
      mountPath: "/api/domains",
      method: "GET",
      middlewares: [],
      modules: [__api_domains_index_ts_onRequestGet],
    },
  {
      routePath: "/api/domains",
      mountPath: "/api/domains",
      method: "POST",
      middlewares: [],
      modules: [__api_domains_index_ts_onRequestPost],
    },
  {
      routePath: "/api/login",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_login_ts_onRequestPost],
    },
  {
      routePath: "/:path*",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [____path___ts_onRequest],
    },
  ]