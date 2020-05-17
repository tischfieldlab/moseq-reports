
// tslint:disable:only-arrow-functions

export default function gridLayout() {
    let numCells = 1;
    let aspect = 1;
    let padding = 0;
    let widthTotal = 550;
    let heightTotal = 300;

    function grid(d) {
        numCells = d.length;

        const widthIndividual = Math.sqrt(aspect * widthTotal * heightTotal / numCells);

        // fill the window horizantally
        const minNx = Math.floor(widthTotal / widthIndividual);
        const maxNy = Math.ceil(numCells / minNx);

        // fill the window vertically
        let maxNx = Math.ceil(widthTotal / widthIndividual);
        let minNy = Math.ceil(numCells / maxNx);

        while (widthTotal / maxNx / aspect * minNy > heightTotal ) {
            maxNx += 1;
            minNy = Math.ceil(numCells / maxNx);
        }

        const horizontalWidth = widthTotal / maxNx;
        const horizontalHeight = horizontalWidth / aspect;

        const verticalHeight = (heightTotal / maxNy);
        const verticalWidth = verticalHeight * aspect;

        const totalAreaHorizontal = numCells * horizontalWidth * horizontalHeight;
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

        return d.map(function(d1, i) {
            const paddingX = widthI * padding;
            const paddingY = heightI * padding;
            return {
                pos: {
                    x: widthI * (i % numX) + (paddingX / 2),
                    y: heightI * Math.floor(i / numX) + (paddingY / 2),
                    width: widthI - paddingX,
                    height: heightI - paddingY,
                    paddingX,
                    paddingY,
                },
                data: d1,
            };
        });
    }

    grid.size = function(_) {
        if (!arguments.length) {
            return _;
        } else {
            widthTotal = _[0];
            heightTotal = _[1];
        }
        return grid;
    };

    grid.aspect = function(_) {
        if (!arguments.length) {
            return aspect;
        } else {
            aspect = _;
        }
        return grid;
    };

    grid.padding = function(_) {
        if (!arguments.length) {
            return padding;
        } else {
            padding = _;
        }
        return grid;
    };

    return grid;
}
