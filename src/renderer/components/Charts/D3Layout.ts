export interface GridCell {
    pos: {
        x: number;
        y: number;
        width: number;
        height: number;
        paddingX: number;
        paddingY: number;
    };
    data: any;
}

export default function gridLayout() {
    let numCells = 1;
    let aspect_ratio = 1;
    let paddingX = 0;
    let paddingY = 0;
    let widthTotal = 550;
    let heightTotal = 300;

    function grid(data: any[]): GridCell[] {
        numCells = data.length;

        const widthIndividual = Math.sqrt((aspect_ratio * widthTotal * heightTotal) / numCells);
        const minNx = Math.floor(widthTotal / widthIndividual);
        const maxNy = Math.ceil(numCells / minNx);

        let maxNx = Math.ceil(widthTotal / widthIndividual);
        let minNy = Math.ceil(numCells / maxNx);

        while ((widthTotal / maxNx / aspect_ratio) * minNy > heightTotal) {
            maxNx += 1;
            minNy = Math.ceil(numCells / maxNx);
        }

        const horizontalWidth = widthTotal / maxNx;
        const horizontalHeight = horizontalWidth / aspect_ratio;

        const widthI = horizontalWidth;
        const heightI = horizontalHeight;

        const numX = maxNx;
        const numY = minNy;

        const cells: GridCell[] = data.map((item, i) => {
            const actualPaddingX = widthI * paddingX;
            const actualPaddingY = heightI * paddingY;
            return {
                pos: {
                    x: widthI * (i % numX) + actualPaddingX / 2,
                    y: heightI * Math.floor(i / numX) + actualPaddingY / 2,
                    width: widthI - actualPaddingX,
                    height: heightI - actualPaddingY,
                    paddingX: actualPaddingX,
                    paddingY: actualPaddingY,
                },
                data: item,
            };
        });

        (cells as any).width = widthI * numX;
        (cells as any).height = heightI * numY;
        return cells;
    }

    function size(): [number, number];
    function size([width, height]: [number, number]): typeof grid;
    function size(width_height?) {
        if (arguments.length === 0) return [widthTotal, heightTotal];
        widthTotal = width_height[0];
        heightTotal = width_height[1];
        return grid;
    }
    grid.size = size;

    function aspect(): number;
    function aspect(newAspect: number): typeof grid;
    function aspect(newAspect?) {
        if (arguments.length === 0) return aspect_ratio;
        if (newAspect !== undefined) aspect_ratio = newAspect;
        return grid;
    }
    grid.aspect = aspect;

    function padding(): [number, number];
    function padding([x, y]: [number, number]): typeof grid;
    function padding(x_y?) {
        if (arguments.length === 0) return [paddingX, paddingY];
        paddingX = x_y[0];
        paddingY = x_y[1];
        return grid;
    };
    grid.padding = padding;

    return grid;
}
