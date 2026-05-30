/** Pass-through PrimeVue — tokeny surface + tryb ciemny (bez :deep / @apply). */

export const ptFieldInputText = {
  root: {
    class:
      'w-full rounded-lg border border-surface-300 bg-surface-0 text-surface-900 placeholder:text-surface-500 ' +
      'enabled:focus:border-primary enabled:focus:shadow-none enabled:focus:ring-0 ' +
      'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
  },
};

export const ptFieldInputTextInField = {
  root: {
    class:
      'w-full rounded-none border-0 bg-transparent text-surface-900 shadow-none placeholder:text-surface-500 ' +
      'enabled:focus:border-transparent enabled:focus:shadow-none enabled:focus:ring-0 ' +
      'dark:bg-transparent dark:text-surface-0 dark:placeholder:text-surface-400',
  },
};

export const ptTextareaField = {
  root: {
    class:
      'w-full min-h-[8rem] resize-y rounded-lg border border-surface-300 bg-surface-0 py-3 text-surface-900 ' +
      'placeholder:text-surface-500 enabled:focus:border-primary enabled:focus:shadow-none enabled:focus:ring-0 ' +
      'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
  },
};

export const ptSelectInField = {
  root: {
    class: 'flex-1 rounded-none border-0 shadow-none',
  },
  label: {
    class: 'border-0 bg-transparent text-surface-900 dark:text-surface-0',
  },
  dropdown: {
    class: 'border-0 bg-transparent text-surface-500 dark:text-surface-400',
  },
};

export const ptAutoCompleteInField = {
  root: {
    class: 'flex min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none',
  },
  pcInputText: {
    root: {
      class:
        'w-full rounded-none border-0 bg-transparent text-surface-900 shadow-none ' +
        'enabled:focus:border-transparent enabled:focus:shadow-none enabled:focus:ring-0 ' +
        'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
    },
  },
  dropdown: {
    class:
      'border-0 bg-transparent text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-0',
  },
};

export const ptDatePickerField = {
  root: {
    class: 'w-full',
  },
  pcInputText: {
    root: {
      class:
        'w-full rounded-lg border border-surface-300 bg-surface-0 text-surface-900 ' +
        'enabled:focus:border-primary enabled:focus:shadow-none enabled:focus:ring-0 ' +
        'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0',
    },
  },
};
