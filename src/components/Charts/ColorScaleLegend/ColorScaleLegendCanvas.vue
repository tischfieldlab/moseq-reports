
<script lang="ts">
import Vue from 'vue';
import ColorScaleLegendBase, {Orientation} from './ColorScaleLegendBase.vue';
import mixins from 'vue-typed-mixins';

export default mixins(ColorScaleLegendBase).extend({
    inject: ['canvas'],
    props: {
        x: {
            required: true,
            type: Number,
            default: 0,
        },
        y: {
            required: true,
            type: Number,
            default: 0,
        },
    },
    render(createElement) {
        const cxt = (this as any).canvas.cxt as CanvasRenderingContext2D;
        if (!cxt) {
            // tslint:disable-next-line:no-console
            console.warn('No canvas context recieved');
            return createElement('div');
        }
        if (!this.scale) {
            // tslint:disable-next-line:no-console
            console.warn('No scale recieved');
            return createElement('div');
        }

        cxt.save();
        cxt.translate(this.x - (this.width / 2), this.y);
        cxt.clearRect(-20, 0, this.width + 30, this.height + 50);

        // Colorbar
        let grad;
        if (this.isHorizontal) {
            grad = cxt.createLinearGradient(0, 0, this.width, 0);
        } else {
            grad = cxt.createLinearGradient(0, this.height, 0, 0);
        }
        if (!(this.scale.domain() as number[]).includes(NaN)) {
            for (const [i, d] of this.scale.domain().entries()) {
                grad.addColorStop((i / (this.scale.domain().length - 1)), this.scale(d));
            }
        }
        cxt.fillStyle = grad;
        cxt.fillRect(0, 0, this.width, this.height);

        // domain line
        /*cxt.beginPath();
        cxt.strokeStyle = '#888';
        cxt.moveTo(0, this.height);
        cxt.lineTo(this.width, this.height);
        cxt.stroke();*/

        // ticks
        const numTicks = this.calcNumTicks(cxt);
        const tickFormat = this.linearscale.tickFormat(numTicks, this.tickformat);
        // apply x-axis labels
        if  (this.isHorizontal) {
            const tickOffset = this.width / 2;
            cxt.textAlign = 'center';
            cxt.textBaseline = 'top';
            cxt.fillStyle = '#888';
            cxt.strokeStyle = '#888';

            this.linearscale.ticks(numTicks).forEach((d, i) => {
                // draw the tick
                cxt.beginPath();
                cxt.moveTo(tickOffset + this.linearscale(d), this.height);
                cxt.lineTo(tickOffset + this.linearscale(d), this.height + 6);
                cxt.stroke();

                cxt.beginPath();
                cxt.fillText(tickFormat(d), tickOffset + this.linearscale(d), this.height + 6);
            });
        } else {
            const tickOffsetX = this.width;
            const tickOffsetY = this.height / 2;
            cxt.textAlign = 'left';
            cxt.textBaseline = 'middle';
            cxt.fillStyle = '#888';
            cxt.strokeStyle = '#888';

            this.linearscale.ticks(numTicks).forEach((d, i) => {
                // draw the tick
                cxt.beginPath();
                cxt.moveTo(tickOffsetX, tickOffsetY + this.linearscale(d));
                cxt.lineTo(tickOffsetX + 6, tickOffsetY + this.linearscale(d));
                cxt.stroke();

                cxt.beginPath();
                cxt.fillText(tickFormat(d), tickOffsetX + 12, tickOffsetY + this.linearscale(d));
            });
        }

        // legend title
        if  (this.isHorizontal) {
            cxt.textAlign = 'center';
            cxt.textBaseline = 'top';
            cxt.font = '13px Verdana';
            cxt.fillStyle = '#888';
            cxt.fillText(this.title, this.width / 2, this.height + 30);
        } else {
            cxt.rotate(-90 * Math.PI / 180);
            cxt.textAlign = 'center';
            cxt.textBaseline = 'top';
            cxt.font = '13px Verdana';
            cxt.fillStyle = '#888';
            cxt.fillText(this.title, -this.height / 2, this.width + 40);
        }

        cxt.restore();
        return createElement('div');
    },
    methods: {
        calcNumTicks(cxt: CanvasRenderingContext2D) {
            // place the ticks and then measure size
            const tickFormat = this.linearscale.tickFormat(undefined, this.tickformat);
            const tickMeasurements = this.linearscale
                .ticks(undefined)
                .map((t) => cxt.measureText(tickFormat(t)));
            const maxWidth = Math.max(...tickMeasurements.map((n) => n.width));
            const maxHeight = parseInt(cxt.font.match(/\d+/) as unknown as string, 10);

            // compute the optimal number of ticks, clamping to min/max
            let numTicks = 0;
            if (this.orientation === Orientation.Horizontal) {
                numTicks = this.width / (maxWidth * 2);
            } else {
                numTicks = this.height / maxHeight;
            }
            if (numTicks > this.maxticks) {
                numTicks = this.maxticks;
            } else if (numTicks < this.minticks) {
                numTicks = this.minticks;
            }
            return numTicks;
        },
    },
});
</script>
