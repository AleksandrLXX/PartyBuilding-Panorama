# 党建全景屏数据字典与接口约定

## 1. 数据接入方式

页面统一通过 `src/utils/getData.js` 的 `getData(dataset, options)` 读取数据。CSV 是当前默认数据源；数据发布前将 `data/raw/*.csv` 同步到 `public/data/*.csv`。

| 模式 | 配置 | 读取地址 | 说明 |
| --- | --- | --- | --- |
| CSV | 默认；或 `getData('home_metrics', { source: 'csv' })` | `${BASE_URL}data/{dataset}.csv` | 本地维护、离线演示和 GitHub Pages 部署使用 |
| API | `.env` 设置 `VITE_DATA_SOURCE=api`；或 `getData(..., { source: 'api' })` | `{VITE_API_BASE_URL}/api/dashboard/{dataset}` | 后端 JSON 接口；跨域时后端需允许当前站点 CORS |
| 单数据集覆盖 | 浏览器 `localStorage.setItem('data_source_home_metrics', 'api'|'csv')` | 覆盖环境默认值 | 仅在设置页选择“跟随环境配置”时生效；旧键 `is_api_{dataset}=true` 仍兼容 |

优先级依次为：代码显式指定的 `source`、设置页选择的本地/API、单数据集覆盖、`VITE_DATA_SOURCE`。设置页选择“跟随环境配置”时跳过第二级。API 地址优先使用设置页填写的服务地址，其次 `VITE_API_BASE_URL`，最后使用同源地址；设置页只接受 HTTP(S) 域名和端口。

### API 响应约定

GET 接口建议返回 JSON 数组，或 `{ "data": [...] }` / `{ "items": [...] }`。数组每项字段名与本字典中对应 CSV 表头一致；数字字段返回 JSON number，日期使用 `YYYY-MM` 或 ISO 8601 字符串。错误请使用非 2xx 状态码及可读错误信息。`VITE_API_BASE_URL` 为空时请求同源 `/api/dashboard/{dataset}`。接口目前不附带认证令牌；如需鉴权，应由部署层提供同源会话或在 `getData.js` 统一补充令牌策略。

示例：`GET /api/dashboard/home_metrics` → `{ "data": [{ "id": "party_members", "label": "党员", "value": 3270, "unit": "人", "caption": "源表系统单位总数" }] }`。

### 数据集字段

所有 CSV 使用 UTF-8（可带 BOM）、首行为表头、逗号分隔；字段名稳定且区分大小写。空行会忽略，CSV 引号字段支持逗号及换行。

#### 首页

| 数据集 / CSV | 字段（类型；必填） | 用途 |
| --- | --- | --- |
| `home_metrics` | `id`（string；是）、`label`（string；是）、`value`（number；是）、`unit`（string；是）、`caption`（string；否） | 顶部关键指标；`id` 唯一 |
| `home_activity_trend` | `month`（YYYY-MM；是）、`activity_count`（number；是）、`attendance_rate`（number，0–100；是） | 近月组织生活趋势；按 `month` 升序 |
| `home_locations` | `location`（string；是）、`unit_count`（number；是）、`member_count`（number；是）、`x` / `y`（number，0–100；是） | 武汉示意点位；`x`、`y` 为画布百分比坐标，不是地理坐标 |

#### 组织建设

以下 3 份表是尚未收到实际 demo 时的**演示样例**，不能作为实际统计结果。

| 数据集 / CSV | 字段（类型；必填） | 用途 |
| --- | --- | --- |
| `org_metrics` | `id`（string；是）、`label`（string；是）、`value`（number；是）、`unit`（string；是）、`caption`（string；否） | 组织建设概览；`id` 唯一 |
| `org_units` | `unit_name`（string；是）、`unit_type`（string；是）、`party_committee_count`（number；是）、`party_branch_count`（number；是）、`member_count`（number；是）、`established_on`（YYYY-MM；是）、`status`（string；是） | 单位/基层组织排行与列表；不含个人姓名 |
| `org_member_structure` | `dimension`（年龄/岗位；是）、`item`（string；是）、`count`（number；是）、`ratio`（number，0–100；是） | 党员年龄与岗位聚合结构；每个维度内比例合计应为 100（允许 0.2 个百分点舍入误差） |

#### 党建工作

| 数据集 / CSV | 字段（类型；必填） | 用途与来源 |
| --- | --- | --- |
| `work_summary` | `unit_count`、`party_committee_count`、`party_general_branch_count`、`party_branch_count`、`party_member_count`（number；是）、`period`（YYYY-MM；否） | 《data/raw/dangjiangongzuo.xlsx》“系统单位总数”行；原表未给统计日期，留空直到业务确认 |
| `work_units` | `unit_name`（string；是）、`party_committee_count`、`committee_member_count`、`discipline_member_count`、`party_general_branch_count`、`party_branch_count`、`party_member_count`（number；是）、`established_on`（YYYY-MM；是） | Excel“基本情况”单位明细；单位名称当前 9 行，源表汇总写 10 家 |
| `work_age_distribution` | `age_group`（string；是）、`member_count`（number；是） | Excel“系统单位党员年龄分布情况” |
| `work_position_distribution` | `position`（string；是）、`member_count`（number；是）、`ratio`（number，0–100；是） | Excel“系统单位在职党员分布情况”；比例由源表小数换算为百分数 |
| `work_branch_distribution` | `branch_type`（string；是）、`branch_count`（number；是） | Excel“系统单位支部分布情况”；分类合计行单独标注 |

## 2. 数据校验与交付规则

- 主键：`home_metrics.id`、`org_metrics.id` 唯一；其他数据集按完整业务维度组合唯一（例如 `org_member_structure.dimension + item`）。
- 所有计数字段须为非负整数；比例范围 0–100；日期统一 `YYYY-MM`。CSV 空值不得用 `-`、`无` 等文本冒充数字。
- 首页的点位坐标 `x`、`y` 仅用于示意图定位，范围 0–100；若改用真实地图，需切换为经纬度并另行定义坐标系。
- 更新 raw CSV 后执行 `pnpm sync:data`（`pnpm build` 会自动同步），确认 `public/data` 文件已更新后再提交/部署。
- 组织建设 demo 数据上线前必须由数据负责人替换并移除页面“演示样例”提示；禁止将样例人口结构作为真实信息发布。
- 原始 Excel 的合计不一致项请看“党建工作源表核对项”；未完成核对前前端原样展示，不自行推算或覆盖源值。
