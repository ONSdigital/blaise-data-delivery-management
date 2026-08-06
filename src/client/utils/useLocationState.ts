import { useLocation } from "react-router-dom";

export function useLocationState<T>(): T | null {
  const { state } = useLocation();

  return state as T | null;
}
