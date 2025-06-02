import { WhiskerType } from "@render/components/Charts/BoxPlot";


export const availableMetrics = {
    angle: {
        title: 'Angle',
        units: 'degrees',
    },
    velocity_2d_mm: {
        title: 'Velocity 2D',
        units: 'mm/s',
    },
    velocity_3d_mm: {
        title: 'Velocity 3D',
        units: 'mm/s',
    },
    velocity_theta: {
        title: 'Velocity Theta',
        units: 'degrees',
    },
    width_mm: {
        title: 'Width',
        units: 'mm',
    },
    height_ave_mm: {
        title: 'Height',
        units: 'mm',
    },
    length_mm: {
        title: 'Length',
        units: 'mm',
    },
    area_mm: {
        title: 'Area',
        units: 'mm^2',
    },
};

export interface ScalarDataSettings {
    metric: string;
    show_points: boolean;
    point_size: number;
    show_boxplot: boolean;
    boxplot_whiskers: WhiskerType;
    show_violinplot: boolean;
    kde_scale: number;
}