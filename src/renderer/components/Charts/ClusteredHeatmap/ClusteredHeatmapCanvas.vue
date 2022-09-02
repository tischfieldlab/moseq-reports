<template>
  <div class="clustered-heatmap-container">
    <canvas
      ref="canvas"
      v-show="has_data"
      v-dpiadapt="{ width: width, height: height }"
      @click="handleHeatmapClick"
      @mousemove="debouncedHover"
      @mouseleave="hoverItem = undefined"
    >
      <ColorScaleLegend
        ref="legend"
        :title="legendTitle"
        :scale="scale.z"
        :width="dims.legend.w"
        :height="10"
        :x="dims.legend.x"
        :y="dims.legend.y"
      />
    </canvas>
    <MessageBox :show="!has_data">{{ noDataMessage }}</MessageBox>
    <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
      <div v-html="tooltip_text" style="text-align: left"></div>
    </ToolTip>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { sum } from "d3";
import ColorScaleLegend from "@render/components/Charts/Colors/ColorScaleLegendCanvas.vue";
import mixins from "vue-typed-mixins";
import ClusteredHeatmapBase from "@render/components/Charts/ClusteredHeatmap/ClusteredHeatmapBase.vue";
import { debounce, throttle } from "@render/util/Events";
import ToolTip from "@render/components/Charts/ToolTip.vue";
import CanvasMixin from "@render/components/Charts/Canvas";
import MessageBox from "@render/components/Charts/CenteredMessage.vue";

export default mixins(ClusteredHeatmapBase, CanvasMixin).extend({
  components: {
    ColorScaleLegend,
    ToolTip,
    MessageBox,
  },
  data() {
    return {};
  },
  mounted() {
    this.debouncedDraw = debounce(this.draw, 50);
    this.debouncedHover = throttle(this.handleHeatmapHover, 10);

    Object.keys(this.$props).forEach((key) => {
      this.watchers.push(
        this.$watch(key, () => {
          this.debouncedDraw();
        })
      );
    });
    Object.keys(this.$data).forEach((key) => {
      this.watchers.push(
        this.$watch(key, () => {
          this.debouncedDraw();
        })
      );
    });
    this.debouncedDraw();
  },
  methods: {
    draw() {
      const cxt = this.canvas.cxt;
      if (cxt === null) {
        return;
      }

      cxt.save();
      // clear canvas
      cxt.clearRect(0, 0, this.width, this.dims.legend.y);

      this.drawHeatmapCells(cxt);
      this.drawRowDendrogram(cxt);
      this.drawColumnDendrogram(cxt);
      this.drawAxisX(cxt);
      this.drawAxisY(cxt);

      cxt.restore();
      (this.$refs.legend as Vue).$forceUpdate();
    },
    drawHeatmapCells(cxt: CanvasRenderingContext2D) {
      cxt.save();
      cxt.translate(this.dims.heatmap.x, this.dims.heatmap.y);
      for (const node of this.data as object[]) {
        cxt.beginPath();
        cxt.rect(
          this.scale.x(node[this.columnKey].toString()),
          this.scale.y(node[this.rowKey].toString()),
          this.scale.x.bandwidth(),
          this.scale.y.bandwidth()
        );
        cxt.fillStyle = this.scale.z(node[this.valueKey]);
        cxt.strokeStyle = this.scale.z(node[this.valueKey]);
        cxt.fill();
        cxt.stroke();
      }
      cxt.restore();
    },
    drawRowDendrogram(cxt: CanvasRenderingContext2D) {
      if (!this.isRowsHClustered) {
        return;
      }
      cxt.save();
      cxt.translate(this.dims.rtree.x, this.dims.rtree.y);
      for (const link of this.rowLinks) {
        cxt.beginPath();
        cxt.strokeStyle = "#aaa";
        cxt.lineWidth = 1.5;
        const p = new Path2D(this.elbowH(link));
        cxt.stroke(p);
      }
      cxt.restore();
    },
    drawColumnDendrogram(cxt: CanvasRenderingContext2D) {
      if (!this.isColumnsHClustered) {
        return;
      }
      cxt.save();
      cxt.translate(this.dims.ctree.x, this.dims.ctree.y);
      for (const link of this.columnLinks) {
        cxt.beginPath();
        cxt.strokeStyle = "#aaa";
        cxt.lineWidth = 1.5;
        const p = new Path2D(this.elbowV(link));
        cxt.stroke(p);
      }
      cxt.restore();
    },
    drawAxisX(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.dims.xaxis.x, this.dims.xaxis.y);

      // Draw x-axis labels and ticks
      this.scale.x.domain().forEach((d) => {
        if (!this.shouldHideLabel(d)) {
          const isSelected = this.selectedCol !== null && this.selectedCol.toString() === d.toString();

          // Draw Tick
          ctx.save();
          ctx.strokeStyle = "#000";
          let yTickOffset: number;
          if (isSelected) {
            ctx.lineWidth = 2;
            yTickOffset = 18;
          } else {
            ctx.lineWidth = 1;
            yTickOffset = 6;
          }
          ctx.beginPath();
          ctx.moveTo(this.scale.x(d) + this.scale.x.bandwidth() / 2, 0);
          ctx.lineTo(this.scale.x(d) + this.scale.x.bandwidth() / 2, yTickOffset);
          ctx.stroke();
          ctx.restore();

          // Draw Label
          ctx.save();
          ctx.textBaseline = "top";
          ctx.fillStyle = this.scale.clc(d);

          if (isSelected) {
            ctx.font = "bold 16px Verdana,Arial,sans-serif";
          } else {
            ctx.font = "8px Verdana,Arial,sans-serif";
          }
          ctx.translate(this.scale.x(d) + this.scale.x.bandwidth() / 2, yTickOffset + 2);

          if (this.rotate_labels) {
            ctx.textAlign = "right";
            ctx.rotate(-Math.PI / 4);
          } else {
            ctx.textAlign = "center";
          }

          ctx.fillText(d, 0, 0);
          ctx.restore();
        }
      });

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      ctx.font = "13px Verdana";
      ctx.fillText(this.xAxisTitle, this.dims.xaxis.w / 2, this.dims.xaxis.ly);
      ctx.restore();

      ctx.restore();
    },
    drawAxisY(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.dims.yaxis.x, this.dims.yaxis.y);

      // Draw y-axis labels and ticks
      this.scale.y.domain().forEach((d) => {
        if (!this.shouldHideLabel(d)) {
          const isSelected = this.selectedRow !== null && this.selectedRow.toString() === d.toString();

          // Draw tick
          ctx.save();
          ctx.strokeStyle = "#000";
          let xTickOffset: number;
          if (isSelected) {
            ctx.lineWidth = 2;
            xTickOffset = 18;
          } else {
            ctx.lineWidth = 1;
            xTickOffset = 6;
          }
          ctx.beginPath();
          ctx.moveTo(0, this.scale.y(d) + this.scale.y.bandwidth() / 2);
          ctx.lineTo(xTickOffset, this.scale.y(d) + this.scale.y.bandwidth() / 2);
          ctx.stroke();
          ctx.restore();

          // Draw Label
          ctx.save();
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillStyle = this.scale.rlc(d);
          if (isSelected) {
            ctx.font = "bold 16px Verdana,Arial,sans-serif";
          } else {
            ctx.font = "8px Verdana,Arial,sans-serif";
          }
          ctx.fillText(d, xTickOffset + 2, this.scale.y(d) + this.scale.y.bandwidth() / 2);
          ctx.restore();
        }
      });

      ctx.save();
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "13px Verdana";
      ctx.fillText(this.yAxisTitle, -this.dims.yaxis.h / 2, 50);
      ctx.restore();

      ctx.restore();
    },
    compute_label_stats(labels: string[]) {
      const cxt = this.canvas.cxt;
      if (cxt !== null) {
        const widths = labels.map((l) => {
          return cxt.measureText(l).width;
        });
        this.label_stats = {
          count: labels.length,
          total: sum(widths),
          longest: Math.max(...widths),
        };
        return;
      }
      // if canvas is not available yet (i.e. before fully mounted)
      // then schedule the calculation for the next tick
      this.$nextTick(() => this.compute_label_stats(labels));
      return;
    },
    handleHeatmapClick(event: MouseEvent) {
      for (const node of this.data as object[]) {
        const x1 = this.dims.heatmap.x + this.scale.x(node[this.columnKey].toString());
        const y1 = this.dims.heatmap.y + this.scale.y(node[this.rowKey].toString());
        const x2 = this.dims.heatmap.x + this.scale.x(node[this.columnKey].toString()) + this.scale.x.bandwidth();
        const y2 = this.dims.heatmap.y + this.scale.y(node[this.rowKey].toString()) + this.scale.y.bandwidth();

        if (event.offsetX > x1 && event.offsetX <= x2 && event.offsetY > y1 && event.offsetY <= y2) {
          // Fire when heatmap is clicked if offset is within range
          // @arg An event, the row key, column key, and value key of the heatmap
          this.$emit("heatmap-click", {
            e: event,
            row: node[this.rowKey],
            col: node[this.columnKey],
            value: node[this.valueKey],
          });
          return;
        }
      }
    },
    handleHeatmapHover(event: MouseEvent) {
      for (const node of this.data as object[]) {
        const x1 = this.dims.heatmap.x + this.scale.x(node[this.columnKey].toString());
        const y1 = this.dims.heatmap.y + this.scale.y(node[this.rowKey].toString());
        const x2 = this.dims.heatmap.x + this.scale.x(node[this.columnKey].toString()) + this.scale.x.bandwidth();
        const y2 = this.dims.heatmap.y + this.scale.y(node[this.rowKey].toString()) + this.scale.y.bandwidth();

        if (event.offsetX > x1 && event.offsetX <= x2 && event.offsetY > y1 && event.offsetY <= y2) {
          this.tooltipPosition = {
            x: event.clientX,
            y: event.clientY,
          };
          this.hoverItem = node;
          (this.$el as HTMLElement).style.cursor = "crosshair";
          return;
        }
      }
      (this.$el as HTMLElement).style.cursor = "inherit";
      this.tooltipPosition = undefined;
      this.hoverItem = undefined;
    },
    heatmap_node_tooltip(item: object) {
      return `<div style="text-align:left;">
                        Group: ${item[this.columnKey]}<br />
                        Module: ${item[this.rowKey]}<br />
                        Usage: ${item[this.valueKey].toExponential(3)}
                    </div>`;
    },
  },
});
</script>

<style scoped>
.clustered-heatmap-container {
  overflow: hidden;
}
</style>
