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
    let aspect = 1;
    let paddingX = 0;
    let paddingY = 0;
    let widthTotal = 550;
    let heightTotal = 300;

    function grid(data: any[]): GridCell[] {
        numCells = data.length;

        const widthIndividual = Math.sqrt((aspect * widthTotal * heightTotal) / numCells);
        const minNx = Math.floor(widthTotal / widthIndividual);
        const maxNy = Math.ceil(numCells / minNx);

        let maxNx = Math.ceil(widthTotal / widthIndividual);
        let minNy = Math.ceil(numCells / maxNx);

        while ((widthTotal / maxNx / aspect) * minNy > heightTotal) {
            maxNx += 1;
            minNy = Math.ceil(numCells / maxNx);
        }

        const horizontalWidth = widthTotal / maxNx;
        const horizontalHeight = horizontalWidth / aspect;

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

    grid.size = function ([width, height]: [number, number]) {
        if (arguments.length === 0) return [widthTotal, heightTotal];
        widthTotal = width;
        heightTotal = height;
        return grid;
    };

    grid.aspect = function (newAspect?: number) {
        if (arguments.length === 0) return aspect;
        if (newAspect !== undefined) aspect = newAspect;
        return grid;
    };

    grid.padding = function ([x, y]: [number, number]) {
        if (arguments.length === 0) return [paddingX, paddingY];
        paddingX = x;
        paddingY = y;
        return grid;
    };

    return grid;
}
