[English](README.md) | [中文](README.cn.md)

## @warpvas/perspective

​	该库是 [warpvas](https://github.com/huanjinliu/warpvas) 库的衍生策略库，应用该策略可以快速实现透视变形效果。

### 安装

```shell
npm i -S warpvas @warpvas/perspective
# or
pnpm add warpvas @warpvas/perspective
```

### 使用

```typescript
import { Warpvas } from 'warpvas';
import perspective from '@warpvas/perspective';

const warpvas = new warpvas(image);
warpvas.setSplitStrategy(perspective);
warpvas.render();
```

**重要提示**

​		应用该透视策略时，当变形区域其中三个顶点形成三角形，而另一个被前面三角形包含时，透视失效会抛出错误，请预先处理该错误逻辑！
