type LoaderFn = { show: () => void; hide: () => void };

let loaderRef: LoaderFn | null = null;

export const registerLoader = (fn: LoaderFn) => {
  loaderRef = fn;
};

export const startLoading = () => loaderRef?.show();
export const stopLoading = () => loaderRef?.hide();
