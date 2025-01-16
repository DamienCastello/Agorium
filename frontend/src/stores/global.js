import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('global', {
  state: () => ({
    reportType: '',
  }),

  actions: {
    setReportType(type) {
      this.reportType = type;
    },

    resetReportType() {
      this.reportType = '';
    },
  },
});
