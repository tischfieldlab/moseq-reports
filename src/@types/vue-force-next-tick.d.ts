import Vue from 'vue';

declare module 'vue/types/vue' {
    interface Vue {
        /**
         * When you need to ensure the DOM has been updated Vue's nextTick 
         * just doesn't work. You will need to use the double requestAnimationFrame 
         * method. This is an elegant wrapper to allow you to use the double 
         * requestAnimationFrame method within your Vue applications either 
         * globally Vue.$forceNextTick(callback) or within a 
         * method this.$forceNextTick(callback)
         *
         * Example:
         * Vue.$forceNextTick(() => {
         *      // Your code here.
         * })
         * 
         * // or 
         * 
         * await Vue.$forceNextTick()
         *
         * @param callback function to call
         */
        $forceNextTick(callback: () => void): void;
        $forceNextTick(): Promise<any>;
    }
}
