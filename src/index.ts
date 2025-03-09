import { Warpvas, utils } from 'warpvas';
import { Bezier } from 'bezier-js';
import type { Region } from 'warpvas/dist/warpvas.class';

type Coord = { x: number; y: number };

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
const strategy = {
  name: 'perspective',
  execute: (warpvas: Warpvas) => {
    const splitPoints: Coord[][][] = [];

    // 根据透视关系获取位置t值
    const getT = (start: number, end: number, item: number, total: number) => {
      if (start === end) return item / total;

      const d = start / end - 1;
      const dt = (item / total) * d;
      const lt = (1 / (1 + dt)) * start;
      const t = 1 - (lt - end) / (start - end);

      // 限制t值 [0, 1]
      return Math.min(1, Math.max(0, t));
    };

    // 判断是否有效透视
    const isInvalid = (vertexs: Region) => {
      const intersectionPoint1 = utils.calcIntersection(
        vertexs.tl,
        vertexs.tr,
        vertexs.bl,
        vertexs.br
      );
      const intersectionPoint2 = utils.calcIntersection(
        vertexs.tl,
        vertexs.bl,
        vertexs.tr,
        vertexs.br
      );

      const isInValidPerspective = (point: Coord | null) =>
        point &&
        Object.values(vertexs).some((vertex, index, arr) =>
          utils.isTriangleContainsPoint(
            point,
            arr[index],
            arr[(index + 1) % 4],
            arr[(index + 2) % 4]
          )
        );

      return (
        isInValidPerspective(intersectionPoint1) ||
        isInValidPerspective(intersectionPoint2)
      );
    };

    warpvas.regionBoundaryCurves.forEach((row, rowIndex) => {
      const _row: Coord[][] = [];
      row.forEach((col, colIndex) => {
        const _col: Coord[] = [];

        const bounds = col;
        const vertexs = {
          tl: bounds.top.points[0],
          tr: bounds.top.points[3],
          bl: bounds.bottom.points[0],
          br: bounds.bottom.points[3],
        };

        if (isInvalid(vertexs))
          throw new Error(
            '[Warpvas: Perspective] Invalid perspective shape: The four control points cannot form a triangle or cross each other'
          );

        const lengths = {
          left: new Bezier(bounds.left.points).length(),
          right: new Bezier(bounds.right.points).length(),
          top: new Bezier(bounds.top.points).length(),
          bottom: new Bezier(bounds.bottom.points).length(),
        };

        // 找点透视消失点
        const verticalVanishingPoint = utils.calcIntersection(
          vertexs.tl,
          vertexs.bl,
          vertexs.tr,
          vertexs.br
        );
        const horizontalVanishingPoint = utils.calcIntersection(
          vertexs.tl,
          vertexs.tr,
          vertexs.bl,
          vertexs.br
        );

        const { vertical, horizontal } =
          warpvas.regionCurves[rowIndex][colIndex];
        const rows = horizontal.length - 1;
        const cols = vertical.length - 1;

        for (let row = 0; row < horizontal.length; row++) {
          for (let col = 0; col < vertical.length; col++) {
            // 找所在的两条线
            // 找纵向线条
            // 找纵向线条对应的两个端点
            let vPoint1 = bounds.top.get(col / cols);
            let vPoint2 = bounds.bottom.get(col / cols);
            if (horizontalVanishingPoint) {
              // 找顶部对应位置的t值
              const ratio_tl_tr =
                utils.calcCoordDistance(vertexs.tl, horizontalVanishingPoint) /
                utils.calcCoordDistance(vertexs.tr, horizontalVanishingPoint);
              const t1 = getT(
                lengths.left,
                lengths.left / ratio_tl_tr,
                col,
                cols
              );
              vPoint1 = bounds.top.get(t1);
              // 找底部对应位置的t值
              const ratio_bl_br =
                utils.calcCoordDistance(vertexs.bl, horizontalVanishingPoint) /
                utils.calcCoordDistance(vertexs.br, horizontalVanishingPoint);
              const t2 = getT(
                lengths.left,
                lengths.left / ratio_bl_br,
                col,
                cols
              );
              vPoint2 = bounds.bottom.get(t2);
            }

            // 找横向线条
            // 找横向线条对应的两个端点
            let hPoint1 = bounds.left.get(row / rows);
            let hPoint2 = bounds.right.get(row / rows);
            if (verticalVanishingPoint) {
              // 找左侧对应位置的t值
              const ratio_tl_bl =
                utils.calcCoordDistance(vertexs.tl, verticalVanishingPoint) /
                utils.calcCoordDistance(vertexs.bl, verticalVanishingPoint);
              const t1 = getT(
                lengths.top,
                lengths.top / ratio_tl_bl,
                row,
                rows
              );
              hPoint1 = bounds.left.get(t1);
              // 找右侧对应位置的t值
              const ratio_tr_br =
                utils.calcCoordDistance(vertexs.tr, verticalVanishingPoint) /
                utils.calcCoordDistance(vertexs.br, verticalVanishingPoint);
              const t2 = getT(
                lengths.top,
                lengths.top / ratio_tr_br,
                row,
                rows
              );
              hPoint2 = bounds.right.get(t2);
            }

            // 找两条线条的交点
            const point = utils.calcIntersection(
              vPoint1,
              vPoint2,
              hPoint1,
              hPoint2
            );

            // 平行的情况随便扔一个点进去就好，反正没有绘制效果
            if (!point) {
              _col.push(vPoint1);
            } else {
              _col.push(point);
            }
          }
        }

        _row.push(_col);
      });
      splitPoints.push(_row);
    });

    return splitPoints;
  },
};

export default strategy;
