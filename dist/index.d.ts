import { Warpvas } from 'warpvas';
type Coord = {
    x: number;
    y: number;
};
/**
 * Warpvas 透视变形计算策略
 *
 * @param warpvas - 需要进行透视变形的贴图对象
 * @returns 返回三维数组，表示网格的分割点坐标：
 * - 第一维：行索引
 * - 第二维：列索引
 * - 第三维：点的坐标 {x, y}
 *
 * @throws {Error} 当四个顶点形成无效的透视形状时抛出错误
 *
 * @example
 * ```typescript
 * import { Warpvas } from 'warpvas';
 * import perspective from 'warpvas-perspective';
 *
 * const warpvas = new warpvas(image);
 * warpvas.setSplitStrategy(perspective);
 * warpvas.render();
 * ```
 *
 * @remarks
 * 当变形区域其中三个顶点形成三角形，而另一个被前面三角形包含时，透视失效会抛出错误，请预先处理该错误逻辑
 */
declare const strategy: {
    name: string;
    execute: (warpvas: Warpvas) => Coord[][][];
};
export default strategy;
