import {useAboutWindowStore} from '@store/aboutwin.store';


export default function showAboutWindow() {
    const aboutWindowStore = useAboutWindowStore();
    aboutWindowStore.show = true;
}
