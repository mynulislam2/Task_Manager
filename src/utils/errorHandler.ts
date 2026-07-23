import { Strings } from '../constants/strings';
import { showToast } from './toast';

interface ErrorWithMessage {
  message: string;
}

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};

const toErrorString = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (isErrorWithMessage(error)) return error.message;
  return Strings.ERROR;
};

export const handleError = (error: unknown, fallbackMessage?: string) => {
  const message = toErrorString(error);
  showToast(fallbackMessage ?? message, 'error');
};
