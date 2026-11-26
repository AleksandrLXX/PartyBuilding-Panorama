# PartyBuilding Panorama

党建大屏项目，采用“设计驱动 + 数据契约驱动 + AI 协作驱动”的研发方式。

## 1. 已实现页面

- 首页：核心指标、组织生活趋势、武汉片区组织力量示意。
- 组织建设：演示单位结构、基层组织架构、党员年龄/岗位结构。
- 党建工作：基于 `data/raw/dangjiangongzuo.xlsx` 提取的组织、党员、年龄、岗位及支部数据，并标记源表差异。
- 先进案例、群团：已加入五模块导航与轮播，当前为待接入占位页。

组织建设与首页中的片区/趋势数据是演示样例。正式部署前请根据 [数据字典](docs/data/data-dictionary.md) 替换并确认业务口径。

## 2. 本地开发与预览

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

维护 `data/raw/*.csv` 后执行 `pnpm sync:data` 发布到 `public/data`；构建会自动同步。切换为后端 API 的步骤与响应契约见 [本地运行说明](docs/usage/local-run.md) 和 [数据字典](docs/data/data-dictionary.md)。

## 3. 发布到 GitHub Pages

1. 首次创建 gh-pages 分支（只需执行一次）

```bash
git checkout --orphan gh-pages
git reset --hard
git commit --allow-empty -m "chore: init gh-pages branch"
git checkout -
```

2. 执行发布

```bash
npm run deploy
```

## 4. 工作目录与用途

### 3.1 目录总览

```text
.
|- design/
|  |- source/               # 设计源文件（psd/figma 导出源）
|  |- exports/v1/           # 设计输出稿（png/jpg/svg），按版本归档
|  |- assets/
|     |- icons/             # 设计产出的图标资源
|     |- backgrounds/       # 设计产出的背景素材
|
|- data/
|  |- raw/                  # 外部原始数据（csv），只追加不覆盖
|  |- schema/               # 数据契约（json schema）
|  |- processed/            # 清洗后的中间数据
|  |- mock/                 # 前端联调用 mock 数据
|
|- docs/
|  |- design-brief/         # 设计概要、交互规则
|  |- data/                 # 数据字典、指标口径
|  |- usage/                # 本地运行、部署、运维说明
|  |- delivery/             # 交付模板、验收清单
|
|- scripts/
|  |- data/                 # CSV 校验、转换脚本
|
|- tests/
|  |- unit/                 # 单元测试
|  |- component/            # 组件测试
|  |- e2e/                  # 端到端测试
|
|- .ai/
|  |- prompts/              # 可复用 AI 任务提示词
|  |- context/              # 术语表、代码规范、协作上下文
```

### 3.2 当前存量素材分类结果

已完成从 design-doc 的分类迁移：

1. 所有 PSD 已迁移到 design/source
2. 所有 PNG 已迁移到 design/exports/v1

建议后续不再直接往 design-doc 放新文件，统一进入 design 目录体系。

### 3.3 文件放置规则

1. 设计源文件
放在 design/source，命名建议：页面名-版本-日期.psd

2. 设计输出稿
放在 design/exports/vX，按发布批次建立版本目录（v1、v2...）

3. 外置数据
CSV 原始文件放 data/raw；处理结果放 data/processed；前端演示数据放 data/mock

4. 设计概要
放 docs/design-brief/design-summary.md，至少包含目标、信息层级、视觉规则、交互规则

5. 使用说明
放 docs/usage 下，按本地运行、发布部署、运维操作拆分文档

## 5. 设计到交付工作流（AI 深度融合）

### 阶段 A：需求与资产入库

1. 新设计稿进入 design/source 与 design/exports/vX
2. 新 CSV 进入 data/raw
3. 更新 docs/design-brief 与 docs/data 的口径说明

### 阶段 B：数据契约先行

1. 先定义 data/schema 下的 schema
2. 用 scripts/data 校验 CSV 列名、类型、缺失值
3. 生成 data/mock 供前端联调

### 阶段 C：模块化实现（竖切）

1. 按“一个业务模块一条竖切”开发
2. 每条竖切顺序：静态布局 -> 数据绑定 -> 动效 -> 响应式 -> 异常态
3. AI 负责脚手架与重复代码，人工负责视觉一致性与业务判断

### 阶段 D：测试与验收

1. 单元测试：格式化、数据转换、计算逻辑
2. 组件测试：核心卡片、图表容器、筛选控件
3. E2E：页面加载、筛选链路、核心指标渲染
4. 验收前做截图对比，控制与设计稿偏差

### 阶段 E：发布与回滚

1. 生成发布说明（变更模块、数据版本、风险点）
2. 执行 npm run deploy
3. 发布后记录预览地址与回滚版本

## 6. 版本管理规范

### 5.1 分支策略

1. main：始终保持可发布
2. feature/xxx：功能开发分支，短生命周期
3. hotfix/xxx：线上问题快速修复

### 5.2 提交规范（Conventional Commits）

1. feat: 新功能
2. fix: 缺陷修复
3. refactor: 重构
4. test: 测试相关
5. docs: 文档更新
6. chore: 工程维护

### 5.3 Pull Request 必填项

1. 关联设计稿版本
2. 关联数据版本（CSV 文件名或批次）
3. 影响范围（页面/模块）
4. 测试证据（截图、录屏、报告）
5. 回滚说明

### 5.4 合并门禁（建议 CI）

1. 构建通过
2. Lint 通过
3. 单测通过
4. E2E 冒烟通过
5. 文档更新齐全（design-brief 与 data 口径）

## 7. 推荐协作节奏

1. 每个迭代先更新 design 与 data，再开开发任务
2. 每个功能分支至少完成一条完整竖切并附测试
3. 每次发布必须打 tag（如 v0.1.0），确保可追溯和可回滚
