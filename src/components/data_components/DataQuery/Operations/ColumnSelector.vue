<template>
    <b-form-group :label="label" :label-for="$id('tags-with-dropdown')" class="container-form-group">
        <b-form-tags :id="$id('tags-with-dropdown')" v-model="localValue" :disabled="disabled" no-outer-focus class="mb-2">
            <template v-slot="{ tags, disabled, addTag, removeTag }">
                <b-dropdown size="sm" variant="outline-secondary" block menu-class="w-100" :disabled="disabled">
                    <template #button-content>
                        <b-icon :icon="icon" />
                    </template>
                    <b-dropdown-form @submit.stop.prevent="() => {}">
                        <b-input-group size="sm" class="mb-2" :disabled="disabled">
                            <b-input-group-prepend is-text>
                                <b-icon icon="search" />
                            </b-input-group-prepend>
                            <b-form-input
                                v-model="search"
                                id="tag-search-input"
                                type="search"
                                size="sm"
                                autocomplete="off"
                                :placeholder="`Search`"
                            ></b-form-input>
                        </b-input-group>
                    </b-dropdown-form>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item-button
                        v-for="option in availableOptions"
                        :key="option"
                        @click="onOptionClick({ option, addTag })"
                        >
                        {{ option }}
                    </b-dropdown-item-button>
                    <b-dropdown-text v-if="availableOptions.length === 0">
                    There are no {{noun}}s available to select
                    </b-dropdown-text>
                </b-dropdown>

                <ul v-if="tags.length > 0" class="list-inline d-inline-block mb-2" style="display: inline !important;">
                    <li v-for="tag in tags" :key="tag" class="list-inline-item">
                        <b-form-tag
                            @remove="removeTag(tag)"
                            :title="tag"
                            :disabled="disabled"
                            variant="info"
                        >{{ tag }}</b-form-tag>
                    </li>
                </ul>
            </template>
        </b-form-tags>
    </b-form-group>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';


export default Vue.extend({
    data() {
        return {
            search: '',
        };
    },
    props: {
        // Column selector label
        label: {
            type: String,
            default: '',
        },
        // Column selector options
        options: {
            type: Array as PropType<string[]>,
        },
        // Value of the column selector
        value: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
        // Boolean describing if the column selctor has been disabled
        disabled: {
            type: Boolean,
            default: false,
        },
        // Column selector icon
        icon: {
            type: String,
            default: 'layout-three-columns',
        },
        // Noun of the column selector
        noun: {
            type: String,
            default: 'Column',
        },
    },
    computed: {
        localValue: {
            get() {return this.value},
            // Fires when local value is set
            // @arg The local value
            set(localValue) { this.$emit('input', localValue)}
        },
        criteria(): string {
            // Compute the search criteria
            return this.search.trim().toLowerCase()
        },
        availableOptions(): string[] {
            const criteria = this.criteria
            // Filter out already selected options
            const options = this.options.filter((opt) => this.value.indexOf(opt) === -1)
            if (criteria) {
                // Show only options that match criteria
                return options.filter(opt => opt.toLowerCase().indexOf(criteria) > -1);
            }
            // Show all options available
            return options
        },
        searchDesc(): string {
            if (this.criteria && this.availableOptions.length === 0) {
                return 'There are no tags matching your search criteria'
            }
            return ''
        },
    },
    methods: {
        onOptionClick({ option, addTag }) {
            addTag(option)
            this.search = ''
        },
    },
});
</script>

<style scoped>
.container-form-group {
    margin-bottom: 0;
    flex: 1 1 auto;
    min-width: 0;
    width:1%;
}
.b-form-tags {
    margin-bottom: 0 !important;
    border-radius: 0;
}
.b-dropdown {
    display: inline-block;
    margin-right: 0.5rem;
}
.b-dropdown-form {
    padding: 0.25rem 0.5rem;
}
.b-dropdown-form > .input-group {
    margin-bottom: 0 !important;
}
</style>