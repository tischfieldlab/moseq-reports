// tslint:disable:only-arrow-functions

export default function gridLayout() {
    let numCells = 1;
    let aspect = 1;
    let paddingX = 0;
    let paddingY = 0;
    let widthTotal = 550;
    let heightTotal = 300;

    function grid(d): GridCell[] {
        numCells = d.length;

        const widthIndividual = Math.sqrt(
            (aspect * widthTotal * heightTotal) / numCells
        );

        // fill the window horizantally
        const minNx = Math.floor(widthTotal / widthIndividual);
        const maxNy = Math.ceil(numCells / minNx);

        // fill the window vertically
        let maxNx = Math.ceil(widthTotal / widthIndividual);
        let minNy = Math.ceil(numCells / maxNx);

        while ((widthTotal / maxNx / aspect) * minNy > heightTotal) {
            maxNx += 1;
            minNy = Math.ceil(numCells / maxNx);
        }

        const horizontalWidth = widthTotal / maxNx;
        const horizontalHeight = horizontalWidth / aspect;

        const verticalHeight = heightTotal / maxNy;
        const verticalWidth = verticalHeight * aspect;

        const totalAreaHorizontal =
            numCells * horizontalWidth * horizontalHeight;
        const totalAreaVertical = numCells * verticalHeight * verticalWidth;

        /*
        console.log('totalAreaHorizontal:', totalAreaHorizontal);
        console.log('totalAreaVertical:', totalAreaVertical);
        */

        const widthI = horizontalWidth;
        const heightI = horizontalHeight;

        const numX = maxNx;
        const numY = minNy;

        /*
        console.log('horizontalHeight:', horizontalHeight);
        console.log('verticalHeight:', verticalHeight);
        console.log('heightI', heightI);
        */

        const cells = d.map(function (d1, i) {
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
                data: d1,
            };
        });
        cells.width = widthI * numX;
        cells.height = heightI * numY;
        return cells;
    }

    grid.size = function (_) {
        if (!arguments.length) {
            return _;
        } else {
            widthTotal = _[0];
            heightTotal = _[1];
        }
        return grid;
    };

    grid.aspect = function (_) {
        if (!arguments.length) {
            return aspect;
        } else {
            aspect = _;
        }
        return grid;
    };

    grid.padding = function (_) {
        if (!arguments.length) {
            return [paddingX, paddingY];
        } else {
            paddingX = _[0];
            paddingY = _[1];
        }
        return grid;
    };

    return grid;
}

export interface GridCell {
    pos: {
        x: number;
        y: number;
        width: number;
        height: number;
        paddingX: number;
        paddingY: number;
    };
    data: string;
}
