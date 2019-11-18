import VueComponent from 'vue';

export class Layout{
    position: Position;
    width: number;
    height: number;
    constructor(){
        this.width = 250;
        this.height = 300;
        this.position = new Position();
    }
}
export class Position{
    x: number;
    y: number;
    constructor(){
        this.x = (Math.random() * (1000 - 300) + 300);
        this.y = (Math.random() * (500 - 100) + 100);
    }
}

export interface IDataWindow{
    title: string;
    type: string;
    layout: Layout;
    settings: Object | undefined;
}

export default class DataWindow implements IDataWindow{
    title: string = "default title";
    type: string;
    layout: Layout;
    instance: VueComponent | undefined;
    settings: Object | undefined;

    constructor(type :string, title:string){
        this.instance = undefined;
        this.type = type;
        this.title = title;
        this.layout = new Layout();
    }
    private getSettings(): Object{
        if(this.instance !== undefined){
            if(this.instance.settings !== undefined){
                if(this.instance.settings.getSettings !== undefined){
                    return this.instance.settings.getSettings();
                }
            }
        }
        return {};
    }

    toJSON(): IDataWindow{
        return {
            title: this.title,
            type: this.type,
            layout: this.layout,
            settings: this.getSettings(),
        };
    }
    static fromJSON(data: IDataWindow){
        const w = new DataWindow(data.type, data.title)
        w.layout.width = data.layout.width;
        w.layout.height = data.layout.height;
        w.layout.position.x = data.layout.position.x;
        w.layout.position.y = data.layout.position.y;
        w.settings = data.settings;
        return w;
    }
}