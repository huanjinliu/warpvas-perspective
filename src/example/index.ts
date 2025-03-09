import { Warpvas } from 'warpvas';
import perspective from 'warpvas-perspective';

const main = async function () {
  const image = new Image();
  image.onload = () => {
    const { naturalHeight: height } = image;
    const warpvas = new Warpvas(image);
    warpvas.setOutputLimitSize({ height: 300 });
    warpvas.setSplitStrategy(perspective)
    warpvas.setRenderingConfig({
      enableGridDisplay: true,
    })
    warpvas.updateVertexCoord(0, 0, 'tl', { x: 0, y: height / 3 });
    warpvas.updateVertexCoord(0, 0, 'bl', { x: 0, y: height / 3 * 2 });
    document.body.appendChild(warpvas.render());
  };
  image.crossOrigin = "Anonymous";
  image.src = "https://i.imgur.com/pBVj9NN.png";
};

main();
