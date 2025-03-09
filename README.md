# warpvas-perspective

[English](README.md) | [中文](README.cn.md)

This library is a derivative strategy library for [warpvas](https://github.com/huanjinliu/warpvas), implementing perspective transformation effects through this strategy.

## Installation

```shell
npm i -S warpvas warpvas-perspective
# or
pnpm add warpvas warpvas-perspective
```

## Usage

```typescript
import { Warpvas } from 'warpvas';
import perspective from 'warpvas-perspective';

const warpvas = new Warpvas(image);
warpvas.setSplitStrategy(perspective);
warpvas.render();
```

**❗Important Note**

When applying this perspective strategy, if three vertices form a triangle while the fourth vertex is contained within that triangle, the perspective transformation will fail and throw an error. Please handle this error condition appropriately in your implementation!
