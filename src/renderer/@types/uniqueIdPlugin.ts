import { App } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export default {
  install(app: App) {
    app.config.globalProperties.$uniqueId = () => uuidv4();
  }
};
