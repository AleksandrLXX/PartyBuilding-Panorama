# PartyBuilding Panorama

## 本地开发与预览

```bash
npm install
npm run dev
npm run preview
```

## gh-pages 发布

1. 首次创建 `gh-pages` 分支（只需执行一次）：

```bash
git checkout --orphan gh-pages
git reset --hard
git commit --allow-empty -m "chore: init gh-pages branch" # 用空提交初始化孤儿分支
git checkout -
```

2. 发布到 `gh-pages` 分支：

```bash
npm run deploy
```
